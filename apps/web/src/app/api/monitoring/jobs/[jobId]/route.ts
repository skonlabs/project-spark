import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import { logger } from '@/lib/logger'

const log = logger('api/monitoring/jobs/[jobId]')

export async function PATCH(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const auth = await requireAuth(req)
    const body = await req.json()

    const job = await prisma.monitoringJob.update({
      where: { id: params.jobId },
      data: {
        name: body.name,
        isActive: body.isActive,
        schedule: body.schedule,
        prompts: body.prompts,
        targetModels: body.targetModels,
        alertOnRankDrop: body.alertOnRankDrop,
        alertOnNewCompetitor: body.alertOnNewCompetitor,
        rankDropThreshold: body.rankDropThreshold,
      },
    })

    log.info('Monitoring job updated', { userId: auth.sub, jobId: params.jobId, isActive: body.isActive })
    return Response.json({ job })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    log.error('Failed to update monitoring job', { jobId: params.jobId, error: (err as Error).message })
    return Response.json({ error: 'Failed to update monitoring job' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const auth = await requireAuth(req)
    await prisma.monitoringJob.delete({ where: { id: params.jobId } })
    log.info('Monitoring job deleted', { userId: auth.sub, jobId: params.jobId })
    return Response.json({ success: true })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    log.error('Failed to delete monitoring job', { jobId: params.jobId, error: (err as Error).message })
    return Response.json({ error: 'Failed to delete monitoring job' }, { status: 500 })
  }
}
