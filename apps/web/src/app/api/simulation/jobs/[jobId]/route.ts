import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import { logger } from '@/lib/logger'

const log = logger('api/simulation/jobs/[jobId]')

export async function GET(_req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    await requireAuth(_req)
    const job = await prisma.simulationJob.findUnique({ where: { id: params.jobId } })
    if (!job) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json({ job })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    log.error('Failed to fetch simulation job', { jobId: params.jobId, error: (err as Error).message })
    return Response.json({ error: 'Failed to fetch job' }, { status: 500 })
  }
}
