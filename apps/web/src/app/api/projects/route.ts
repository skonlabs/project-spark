import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspaceId') || auth.workspaceId

    if (!workspaceId) {
      return Response.json({ error: 'workspaceId required' }, { status: 400 })
    }

    const projects = await prisma.project.findMany({
      where: { workspaceId, isActive: true },
      orderBy: { updatedAt: 'desc' },
    })

    return Response.json({ projects })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    console.error('[projects GET]', err)
    return Response.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const body = await req.json()
    const workspaceId = body.workspaceId || auth.workspaceId

    if (!workspaceId) {
      return Response.json({ error: 'workspaceId required' }, { status: 400 })
    }

    if (!body.name || !body.productName) {
      return Response.json({ error: 'name and productName are required' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        workspaceId,
        name: body.name,
        description: body.description,
        productName: body.productName,
        productDescription: body.productDescription,
        productUrl: body.productUrl,
        productCategory: body.productCategory,
        targetAudience: body.targetAudience,
        targetLlms: body.targetLlms || [],
        monitoringPrompts: body.monitoringPrompts || [],
      },
    })

    return Response.json({ project }, { status: 201 })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    console.error('[projects POST]', err)
    return Response.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
