import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import { runSimulation } from '@/lib/services/simulation'

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)
    const { projectId, name, prompts, targetModels } = await req.json()

    if (!projectId || !prompts?.length) {
      return Response.json({ error: 'projectId and prompts are required' }, { status: 400 })
    }

    const job = await prisma.simulationJob.create({
      data: {
        projectId,
        name: name || `Simulation ${new Date().toISOString()}`,
        prompts,
        targetModels: targetModels || [],
        status: 'pending',
      },
    })

    // Fire and forget — run async
    runSimulation(job.id).catch((err) => console.error('[simulation background]', err))

    return Response.json({ jobId: job.id, status: 'running' }, { status: 202 })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    console.error('[simulation/run]', err)
    return Response.json({ error: 'Failed to start simulation' }, { status: 500 })
  }
}
