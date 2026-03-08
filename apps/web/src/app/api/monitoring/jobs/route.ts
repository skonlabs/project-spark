import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) return Response.json({ error: 'projectId required' }, { status: 400 })

    const jobs = await prisma.monitoringJob.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ jobs })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Failed to fetch monitoring jobs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)
    const body = await req.json()

    const {
      projectId, name, schedule, prompts, targetModels,
      alertOnRankDrop, alertOnNewCompetitor, rankDropThreshold,
    } = body

    if (!projectId || !name) {
      return Response.json({ error: 'projectId and name required' }, { status: 400 })
    }

    const job = await prisma.monitoringJob.create({
      data: {
        projectId,
        name,
        schedule: schedule || '0 9 * * *',
        prompts: prompts || [],
        targetModels: targetModels || [],
        alertOnRankDrop: alertOnRankDrop ?? true,
        alertOnNewCompetitor: alertOnNewCompetitor ?? true,
        rankDropThreshold: rankDropThreshold ?? 3,
      },
    })

    return Response.json({ job }, { status: 201 })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Failed to create monitoring job' }, { status: 500 })
  }
}
