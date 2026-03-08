import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    await requireAuth(req)

    const nodes = await prisma.topicNode.findMany({
      where: { projectId: params.projectId },
      include: {
        edgesFrom: true,
        edgesTo: true,
      },
      orderBy: [{ depth: 'asc' }, { importanceScore: 'desc' }],
    })

    const edges = await prisma.topicEdge.findMany({
      where: { projectId: params.projectId },
    })

    return Response.json({ nodes, edges })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Failed to fetch topic graph' }, { status: 500 })
  }
}
