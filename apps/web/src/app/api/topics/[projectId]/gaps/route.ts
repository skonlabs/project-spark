import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    await requireAuth(req)

    const gaps = await prisma.topicNode.findMany({
      where: {
        projectId: params.projectId,
        OR: [
          { nodeType: 'gap' },
          { isCovered: false },
        ],
      },
      orderBy: { importanceScore: 'desc' },
    })

    return Response.json({ gaps })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Failed to fetch topic gaps' }, { status: 500 })
  }
}
