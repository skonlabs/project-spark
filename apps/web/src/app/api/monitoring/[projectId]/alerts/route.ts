import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import { logger } from '@/lib/logger'

const log = logger('api/monitoring/alerts')

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    const alerts = await prisma.monitoringAlert.findMany({
      where: {
        projectId: params.projectId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { job: { select: { name: true } } },
    })

    return Response.json({ alerts })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    log.error('Failed to fetch alerts', { projectId: params.projectId, error: (err as Error).message })
    return Response.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const auth = await requireAuth(req)
    const { alertIds, isRead, isResolved } = await req.json()

    await prisma.monitoringAlert.updateMany({
      where: {
        id: { in: alertIds },
        projectId: params.projectId,
      },
      data: {
        ...(isRead !== undefined ? { isRead } : {}),
        ...(isResolved !== undefined ? { isResolved } : {}),
      },
    })

    log.info('Alerts updated', { userId: auth.sub, projectId: params.projectId, alertCount: alertIds?.length, isRead, isResolved })
    return Response.json({ success: true })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    log.error('Failed to update alerts', { projectId: params.projectId, error: (err as Error).message })
    return Response.json({ error: 'Failed to update alerts' }, { status: 500 })
  }
}
