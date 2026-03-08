import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import { runSimulation } from '@/lib/services/simulation'

export async function POST(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    await requireAuth(req)

    const monJob = await prisma.monitoringJob.findUniqueOrThrow({
      where: { id: params.jobId },
    })

    // Create a simulation job from the monitoring job config
    const simJob = await prisma.simulationJob.create({
      data: {
        projectId: monJob.projectId,
        name: `Monitor: ${monJob.name}`,
        prompts: monJob.prompts,
        targetModels: monJob.targetModels,
        status: 'pending',
      },
    })

    // Run and check for alerts
    runSimulation(simJob.id)
      .then(async () => {
        await prisma.monitoringJob.update({
          where: { id: params.jobId },
          data: { lastRunAt: new Date(), lastRunStatus: 'completed' },
        })
      })
      .catch(async (err: Error) => {
        await prisma.monitoringJob.update({
          where: { id: params.jobId },
          data: { lastRunAt: new Date(), lastRunStatus: 'failed' },
        })
        await prisma.monitoringAlert.create({
          data: {
            jobId: params.jobId,
            projectId: monJob.projectId,
            severity: 'critical',
            alertType: 'run_failed',
            title: 'Monitoring run failed',
            description: err.message,
          },
        })
      })

    return Response.json({ simJobId: simJob.id, status: 'running' })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Failed to run monitoring job' }, { status: 500 })
  }
}
