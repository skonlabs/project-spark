import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    await requireAuth(req)

    // Aggregate share of voice from simulation results
    const results = await prisma.simulationResult.findMany({
      where: { projectId: params.projectId },
      select: {
        productMentioned: true,
        competitorsMentioned: true,
        mentionRank: true,
        sentimentScore: true,
        llmModel: true,
      },
    })

    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
      select: { productName: true },
    })

    const totalSimulations = results.length
    const productMentions = results.filter((r) => r.productMentioned).length

    // Count competitor mentions
    const competitorCounts: Record<string, number> = {}
    for (const r of results) {
      for (const c of r.competitorsMentioned as string[]) {
        competitorCounts[c] = (competitorCounts[c] || 0) + 1
      }
    }

    // Build share of voice data
    const allMentions = productMentions + Object.values(competitorCounts).reduce((a, b) => a + b, 0)
    const shareOfVoice = [
      {
        name: project?.productName || 'Your Product',
        mentions: productMentions,
        sharePercent: allMentions > 0 ? (productMentions / allMentions) * 100 : 0,
        isProduct: true,
      },
      ...Object.entries(competitorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, mentions]) => ({
          name,
          mentions,
          sharePercent: allMentions > 0 ? (mentions / allMentions) * 100 : 0,
          isProduct: false,
        })),
    ]

    // Per-model breakdown
    const modelBreakdown: Record<string, { mentioned: number; total: number }> = {}
    for (const r of results) {
      if (!modelBreakdown[r.llmModel]) modelBreakdown[r.llmModel] = { mentioned: 0, total: 0 }
      modelBreakdown[r.llmModel].total++
      if (r.productMentioned) modelBreakdown[r.llmModel].mentioned++
    }

    return Response.json({
      totalSimulations,
      shareOfVoice,
      modelBreakdown,
      avgMentionRank:
        results
          .filter((r) => r.mentionRank !== null)
          .reduce((s, r) => s + (r.mentionRank || 0), 0) /
        (results.filter((r) => r.mentionRank !== null).length || 1),
    })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Failed to compute share of voice' }, { status: 500 })
  }
}
