import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    await requireAuth(req)

    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
      select: {
        visibilityScore: true,
        scoreBreakdown: true,
        updatedAt: true,
        analysisReports: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, status: true, createdAt: true, overallScore: true },
        },
      },
    })

    if (!project) return Response.json({ error: 'Not found' }, { status: 404 })

    return Response.json({
      visibilityScore: project.visibilityScore,
      scoreBreakdown: project.scoreBreakdown,
      lastAnalysis: project.analysisReports[0] || null,
      updatedAt: project.updatedAt,
    })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Failed to fetch score' }, { status: 500 })
  }
}
