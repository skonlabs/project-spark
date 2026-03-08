import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import { runSimulation } from '@/lib/services/simulation'
import { logger } from '@/lib/logger'

const log = logger('api/simulation/run')

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const { projectId, name, prompts, targetModels } = await req.json()

    if (!projectId || !prompts?.length) {
      return Response.json({ error: 'projectId and prompts required' }, { status: 400 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        workspace: { members: { some: { userId: auth.sub, isActive: true } } },
      },
    })
    if (!project) {
      log.warn('Unauthorized simulation attempt', { userId: auth.sub, projectId })
      return Response.json({ error: 'Project not found or access denied' }, { status: 403 })
    }

    const job = await prisma.simulationJob.create({
      data: { projectId, name, prompts, targetModels: targetModels || [] },
    })

    log.info('Simulation job created', { jobId: job.id, projectId, userId: auth.sub })

    // Fire-and-forget
    runSimulation(job.id).catch((err) => {
      log.error('Simulation background error', { jobId: job.id, error: err.message })
    })

    return Response.json({ jobId: job.id, status: 'running' }, { status: 202 })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    log.error('Failed to start simulation', { error: (err as Error).message })
    return Response.json({ error: 'Failed to start simulation' }, { status: 500 })
  }
}
