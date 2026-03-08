import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import { ingestUrl } from '@/lib/services/ingestion'

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)
    const { projectId, url } = await req.json()

    if (!projectId || !url) {
      return Response.json({ error: 'projectId and url are required' }, { status: 400 })
    }

    const asset = await prisma.contentAsset.create({
      data: {
        projectId,
        sourceUrl: url,
        sourceType: 'url',
        status: 'processing',
      },
    })

    try {
      const ingested = await ingestUrl(url)

      const updated = await prisma.contentAsset.update({
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

      return Response.json({ asset: updated }, { status: 201 })
    } catch (err) {
      await prisma.contentAsset.update({
        where: { id: asset.id },
        data: {
          status: 'failed',
          errorMessage: err instanceof Error ? err.message : 'URL ingestion failed',
        },
      })
      throw err
    }
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    console.error('[ingest/url]', err)
    return Response.json({ error: 'URL ingestion failed' }, { status: 500 })
  }
}
