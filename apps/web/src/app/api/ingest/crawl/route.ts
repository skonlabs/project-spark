import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import { fetchSitemapUrls, ingestUrl } from '@/lib/services/ingestion'

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)
    const { projectId, sitemapUrl, maxPages = 20 } = await req.json()

    if (!projectId || !sitemapUrl) {
      return Response.json({ error: 'projectId and sitemapUrl are required' }, { status: 400 })
    }

    const urls = (await fetchSitemapUrls(sitemapUrl)).slice(0, maxPages)

    const results = await Promise.allSettled(
      urls.map(async (url) => {
        const asset = await prisma.contentAsset.create({
          data: { projectId, sourceUrl: url, sourceType: 'sitemap', status: 'processing' },
        })

        try {
          const ingested = await ingestUrl(url)
          return prisma.contentAsset.update({
            where: { id: asset.id },
            data: {
              title: ingested.title,
              rawText: ingested.rawText,
              wordCount: ingested.wordCount,
              metadata: ingested.metadata as object,
              entities: ingested.entities,
              topics: ingested.topics,
              sentiment: ingested.sentiment,
              status: 'completed',
            },
          })
        } catch (err) {
          await prisma.contentAsset.update({
            where: { id: asset.id },
            data: {
              status: 'failed',
              errorMessage: err instanceof Error ? err.message : 'Failed',
            },
          })
          throw err
        }
      })
    )

    const succeeded = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return Response.json({ total: urls.length, succeeded, failed })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    console.error('[ingest/crawl]', err)
    return Response.json({ error: 'Crawl failed' }, { status: 500 })
  }
}
