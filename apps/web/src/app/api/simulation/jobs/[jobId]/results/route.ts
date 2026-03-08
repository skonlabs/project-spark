import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    await requireAuth(req)

    const job = await prisma.simulationJob.findUnique({
      where: { id: params.jobId },
      include: {
        results: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!job) return Response.json({ error: 'Not found' }, { status: 404 })

    return Response.json({ job, results: job.results })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}
