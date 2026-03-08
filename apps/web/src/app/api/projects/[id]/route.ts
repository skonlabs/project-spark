import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(req)

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        contentAssets: { where: { status: 'completed' }, take: 10 },
        competitors: true,
        analysisReports: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })

    if (!project) return Response.json({ error: 'Not found' }, { status: 404 })

    return Response.json({ project })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(req)
    const body = await req.json()

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        productName: body.productName,
        productDescription: body.productDescription,
        productUrl: body.productUrl,
        productCategory: body.productCategory,
        targetAudience: body.targetAudience,
        targetLlms: body.targetLlms,
        monitoringPrompts: body.monitoringPrompts,
        settings: body.settings,
      },
    })

    return Response.json({ project })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(req)

    await prisma.project.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return Response.json({ success: true })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
