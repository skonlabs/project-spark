import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    await requireAuth(req)

    const jobs = await prisma.simulationJob.findMany({
      where: { projectId: params.projectId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return Response.json({ jobs })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Failed to fetch simulation jobs' }, { status: 500 })
  }
}
