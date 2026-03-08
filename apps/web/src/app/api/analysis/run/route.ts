import { NextRequest } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import { enqueueAnalysis } from '@/lib/services/analysis'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

const log = logger('api/analysis/run')

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const { projectId } = await req.json()

    if (!projectId) {
      return Response.json({ error: 'projectId required' }, { status: 400 })
    }

    // Verify the project belongs to the authenticated user's workspace
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        workspace: {
          members: { some: { userId: auth.sub, isActive: true } },
        },
      },
    })

    if (!project) {
      log.warn('Unauthorized analysis attempt', { userId: auth.sub, projectId })
      return Response.json({ error: 'Project not found or access denied' }, { status: 403 })
    }

    // Returns immediately — analysis runs in the background
    const reportId = await enqueueAnalysis(projectId, auth.sub)
    log.info('Analysis enqueued via API', { userId: auth.sub, projectId, reportId })

    return Response.json({ reportId, status: 'running' }, { status: 202 })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    log.error('Failed to enqueue analysis', { error: (err as Error).message })
    return Response.json({ error: 'Failed to start analysis' }, { status: 500 })
  }
}
