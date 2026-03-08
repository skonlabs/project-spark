import { callClaudeJSON } from './anthropic'
import { prisma } from '../prisma'

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

export async function runFullAnalysis(projectId: string): Promise<string> {
  // Create the report record first
  const report = await prisma.analysisReport.create({
    data: { projectId, status: 'running' },
  })

  // Update project score to show analysis in progress
  await prisma.project.update({
    where: { id: projectId },
    data: { visibilityScore: null },
  })

  try {
    const project = await prisma.project.findUniqueOrThrow({
      where: { id: projectId },
      include: {
        contentAssets: {
          where: { status: 'completed' },
          take: 20,
        },
        competitors: true,
      },
    })

    const contentSummary = project.contentAssets
      .map((a) => `Title: ${a.title || 'Untitled'}\nTopics: ${JSON.stringify(a.topics)}\nEntities: ${JSON.stringify(a.entities)}\nSentiment: ${a.sentiment}\nWords: ${a.wordCount}`)
      .join('\n\n---\n\n')

    const competitorNames = project.competitors.map((c) => c.name).join(', ')

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
  "scoreBreakdown": {
    "entityClarity": 0-100,
    "categoryOwnership": 0-100,
    "educational": 0-100,
    "promptCoverage": 0-100,
    "comparison": 0-100,
    "ecosystem": 0-100,
    "externalAuthority": 0-100,
    "communitySignal": 0-100,
    "consistency": 0-100,
    "structureQuality": 0-100
  },
  "findings": {
    "strengths": ["..."],
    "weaknesses": ["..."],
    "opportunities": ["..."]
  },
  "recommendations": ["..."],
  "contentGaps": [
    {
      "topic": "...",
      "priority": "high|medium|low",
      "rationale": "...",
      "suggestedTitle": "..."
    }
  ],
  "promptClusters": {
    "cluster_name": ["prompt1", "prompt2"]
  },
  "contentRoadmap": [
    {
      "title": "...",
      "type": "article|faq|comparison|entity-definition",
      "priority": 1-10,
      "estimatedImpact": 0-100,
      "topic": "...",
      "targetPrompts": ["..."]
    }
  ]
}`,
      'You are an AI Engine Optimization expert. Score content strategy for AI discoverability.'
    )

    const breakdown = result.scoreBreakdown

    await prisma.analysisReport.update({
      where: { id: report.id },
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
      data: {
        visibilityScore: result.overallScore,
        scoreBreakdown: breakdown as object,
      },
    })

    return report.id
  } catch (err) {
    await prisma.analysisReport.update({
      where: { id: report.id },
      data: {
        status: 'failed',
        errorMessage: err instanceof Error ? err.message : 'Analysis failed',
      },
    })
    throw err
  }
}
