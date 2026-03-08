import { callClaudeJSON } from './anthropic'
import { prisma } from '../prisma'
import { logger } from '../logger'

const log = logger('analysis')

export interface AEOScoreBreakdown {
  entityClarity: number
  categoryOwnership: number
  educational: number
  promptCoverage: number
  comparison: number
  ecosystem: number
  externalAuthority: number
  communitySignal: number
  consistency: number
  structureQuality: number
}

export interface AnalysisFindings {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
}

export interface ContentGap {
  topic: string
  priority: 'high' | 'medium' | 'low'
  rationale: string
  suggestedTitle: string
}

export interface RoadmapItem {
  title: string
  type: 'article' | 'faq' | 'comparison' | 'entity-definition'
  priority: number
  estimatedImpact: number
  topic: string
  targetPrompts: string[]
}

export interface FullAnalysisResult {
  overallScore: number
  scoreBreakdown: AEOScoreBreakdown
  findings: AnalysisFindings
  recommendations: string[]
  contentGaps: ContentGap[]
  promptClusters: Record<string, string[]>
  contentRoadmap: RoadmapItem[]
}

/**
 * Enqueues an analysis job: creates the report record and kicks off the
 * long-running Claude call in the background (fire-and-forget).
 * Returns the reportId immediately so the caller can poll for completion.
 */
export async function enqueueAnalysis(projectId: string, userId?: string): Promise<string> {
  const report = await prisma.analysisReport.create({
    data: { projectId, status: 'running' },
  })

  await prisma.project.update({
    where: { id: projectId },
    data: { visibilityScore: null },
  })

  log.info('Analysis enqueued', { projectId, reportId: report.id, userId })

  // Fire-and-forget — do NOT await this
  runAnalysisInBackground(projectId, report.id, userId).catch((err) => {
    log.error('Unhandled error in background analysis', {
      projectId,
      reportId: report.id,
      error: err instanceof Error ? err.message : String(err),
    })
  })

  return report.id
}

async function runAnalysisInBackground(
  projectId: string,
  reportId: string,
  userId?: string
): Promise<void> {
  const start = Date.now()
  log.info('Analysis started', { projectId, reportId, userId })

  try {
    const project = await prisma.project.findUniqueOrThrow({
      where: { id: projectId },
      include: {
        contentAssets: { where: { status: 'completed' }, take: 20 },
        competitors: true,
      },
    })

    const contentSummary = project.contentAssets
      .map(
        (a) =>
          `Title: ${a.title || 'Untitled'}\nTopics: ${JSON.stringify(a.topics)}\nEntities: ${JSON.stringify(a.entities)}\nSentiment: ${a.sentiment}\nWords: ${a.wordCount}`
      )
      .join('\n\n---\n\n')

    const competitorNames = project.competitors.map((c) => c.name).join(', ')

    log.info('Calling Claude for AEO analysis', {
      projectId,
      assetCount: project.contentAssets.length,
      competitorCount: project.competitors.length,
    })

    const result = await callClaudeJSON<FullAnalysisResult>(
      `You are an AI Engine Optimization (AEO) expert analyzing a product's content strategy.

PRODUCT: ${project.productName}
DESCRIPTION: ${project.productDescription || 'Not provided'}
CATEGORY: ${project.productCategory || 'Not specified'}
TARGET AUDIENCE: ${project.targetAudience || 'Not specified'}
COMPETITORS: ${competitorNames || 'None specified'}
MONITORING PROMPTS: ${JSON.stringify(project.monitoringPrompts)}

CONTENT ASSETS (${project.contentAssets.length} items):
${contentSummary || 'No content assets yet'}

Score each of the 10 AEO signal dimensions from 0-100:
1. entityClarity: How clearly the product/brand is defined as a distinct entity
2. categoryOwnership: How strongly the product owns its category in AI training data signals
3. educational: Depth and quality of educational/how-to content
4. promptCoverage: Coverage of common user prompts/questions in the space
5. comparison: Quality of comparison and competitive differentiation content
6. ecosystem: Integration guides, API docs, partner content coverage
7. externalAuthority: Third-party mentions, reviews, citations quality
8. communitySignal: Community engagement signals (forums, Q&A, social)
9. consistency: Cross-content consistency of messaging and positioning
10. structureQuality: Schema markup, structured data, content format quality

Respond with this exact JSON structure:
{
  "overallScore": 0-100,
  "scoreBreakdown": {"entityClarity":0,"categoryOwnership":0,"educational":0,"promptCoverage":0,"comparison":0,"ecosystem":0,"externalAuthority":0,"communitySignal":0,"consistency":0,"structureQuality":0},
  "findings": {"strengths":["..."],"weaknesses":["..."],"opportunities":["..."]},
  "recommendations": ["..."],
  "contentGaps": [{"topic":"...","priority":"high|medium|low","rationale":"...","suggestedTitle":"..."}],
  "promptClusters": {"cluster_name":["prompt1","prompt2"]},
  "contentRoadmap": [{"title":"...","type":"article|faq|comparison|entity-definition","priority":1,"estimatedImpact":0,"topic":"...","targetPrompts":["..."]}]
}`,
      'You are an AI Engine Optimization expert. Score content strategy for AI discoverability.'
    )

    const breakdown = result.scoreBreakdown

    await prisma.analysisReport.update({
      where: { id: reportId },
      data: {
        status: 'completed',
        overallScore: result.overallScore,
        entityClarityScore: breakdown.entityClarity,
        categoryOwnershipScore: breakdown.categoryOwnership,
        educationalScore: breakdown.educational,
        promptCoverageScore: breakdown.promptCoverage,
        comparisonScore: breakdown.comparison,
        ecosystemScore: breakdown.ecosystem,
        externalAuthorityScore: breakdown.externalAuthority,
        communitySignalScore: breakdown.communitySignal,
        consistencyScore: breakdown.consistency,
        structureQualityScore: breakdown.structureQuality,
        findings: result.findings as object,
        recommendations: result.recommendations,
        contentGaps: result.contentGaps as object[],
        promptClusters: result.promptClusters as object,
        contentRoadmap: result.contentRoadmap as object[],
      },
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { visibilityScore: result.overallScore, scoreBreakdown: breakdown as object },
    })

    log.info('Analysis completed', {
      projectId,
      reportId,
      overallScore: result.overallScore,
      durationMs: Date.now() - start,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    log.error('Analysis failed', { projectId, reportId, error: message, userId })
    await prisma.analysisReport.update({
      where: { id: reportId },
      data: { status: 'failed', errorMessage: message },
    })
    throw err
  }
}
