import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import { ingestPdf, ingestDocx, ingestText } from '@/lib/services/ingestion'

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const projectId = formData.get('projectId') as string

    if (!file || !projectId) {
      return Response.json({ error: 'file and projectId are required' }, { status: 400 })
    }

    // Create asset record immediately
    const asset = await prisma.contentAsset.create({
      data: {
        projectId,
        title: file.name,
        sourceType: 'file_upload',
        fileType: file.type,
        status: 'processing',
      },
    })

    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      let ingested

      if (file.type === 'application/pdf') {
        ingested = await ingestPdf(buffer)
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
      ) {
        ingested = await ingestDocx(buffer)
      } else {
        // Plain text, markdown, etc.
        ingested = await ingestText(buffer.toString('utf-8'), file.name)
      }

      const updated = await prisma.contentAsset.update({
        where: { id: asset.id },
        data: {
          title: ingested.title || file.name,
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
          errorMessage: err instanceof Error ? err.message : 'Ingestion failed',
        },
      })
      throw err
    }
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    console.error('[ingest/upload]', err)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}
