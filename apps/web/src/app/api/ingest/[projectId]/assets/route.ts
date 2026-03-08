import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const assets = await prisma.contentAsset.findMany({
      where: {
        projectId: params.projectId,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        sourceUrl: true,
        sourceType: true,
        status: true,
        wordCount: true,
        topics: true,
        sentiment: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return Response.json({ assets })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const assetId = searchParams.get('assetId')

    if (!assetId) {
      return Response.json({ error: 'assetId required' }, { status: 400 })
    }

    await prisma.contentAsset.delete({
      where: { id: assetId, projectId: params.projectId },
    })

    return Response.json({ success: true })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Failed to delete asset' }, { status: 500 })
  }
}
