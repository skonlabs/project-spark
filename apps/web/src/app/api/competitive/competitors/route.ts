import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) return Response.json({ error: 'projectId required' }, { status: 400 })

    const competitors = await prisma.competitor.findMany({
      where: { projectId },
      orderBy: { llmShareOfVoice: 'desc' },
    })

    return Response.json({ competitors })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Failed to fetch competitors' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)
    const { projectId, name, websiteUrl, description } = await req.json()

    if (!projectId || !name) {
      return Response.json({ error: 'projectId and name required' }, { status: 400 })
    }

    const competitor = await prisma.competitor.create({
      data: { projectId, name, websiteUrl, description },
    })

    return Response.json({ competitor }, { status: 201 })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Failed to create competitor' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return Response.json({ error: 'id required' }, { status: 400 })

    await prisma.competitor.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Failed to delete competitor' }, { status: 500 })
  }
}
