import { callLLM } from './anthropic'
import { prisma } from '../prisma'
import { logger } from '../logger'

const log = logger('simulation')

export interface SimulationPromptResult {
  prompt: string
  provider: string
  model: string
  responseText: string
  productMentioned: boolean
  mentionRank: number | null
  mentionContext: string | null
  sentimentScore: number
  confidenceScore: number
  entitiesMentioned: string[]
  competitorsMentioned: string[]
  citations: string[]
  latencyMs: number
}

const LLM_MODELS = [
  { provider: 'anthropic' as const, model: 'claude-sonnet-4-6' },
  { provider: 'openai' as const, model: 'gpt-4o' },
  { provider: 'google' as const, model: 'gemini-1.5-pro' },
]

/** Run at most N tasks concurrently */
async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = []
  let index = 0

  async function worker() {
    while (index < tasks.length) {
      const taskIndex = index++
      try {
        results[taskIndex] = { status: 'fulfilled', value: await tasks[taskIndex]() }
      } catch (err) {
        results[taskIndex] = { status: 'rejected', reason: err }
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker))
  return results
}

export async function runSimulation(jobId: string): Promise<void> {
  const job = await prisma.simulationJob.findUniqueOrThrow({
    where: { id: jobId },
    include: { project: true },
  })

  await prisma.simulationJob.update({ where: { id: jobId }, data: { status: 'running' } })

  const start = Date.now()
  log.info('Simulation started', { jobId, projectId: job.projectId })

  try {
    const prompts = job.prompts as string[]
    const targetModels = job.targetModels as Array<{ provider: string; model: string }>
    const models = targetModels.length > 0 ? targetModels : LLM_MODELS
    const productName = job.project.productName

    log.info('Simulation tasks', {
      jobId,
      promptCount: prompts.length,
      modelCount: models.length,
      totalTasks: prompts.length * models.length,
    })

    const tasks: (() => Promise<void>)[] = []
    for (const prompt of prompts) {
      for (const { provider, model } of models) {
        tasks.push(() =>
          runSingleSimulation(
            jobId,
            job.projectId,
            prompt,
            provider as 'anthropic' | 'openai' | 'google',
            model,
            productName
          )
        )
      }
    }

    // Limit to 5 concurrent LLM requests to avoid rate limits
    await runWithConcurrency(tasks, 5)

    const results = await prisma.simulationResult.findMany({ where: { jobId } })

    const total = results.length
    const mentioned = results.filter((r) => r.productMentioned).length
    const avgRank =
      results
        .filter((r) => r.mentionRank !== null)
        .reduce((s, r) => s + (r.mentionRank || 0), 0) /
      (results.filter((r) => r.mentionRank !== null).length || 1)
    const avgSentiment =
      results.reduce((s, r) => s + (r.sentimentScore || 0), 0) / (total || 1)

    const competitorCounts: Record<string, number> = {}
    for (const r of results) {
      for (const c of r.competitorsMentioned as string[]) {
        competitorCounts[c] = (competitorCounts[c] || 0) + 1
      }
    }

    await prisma.simulationJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        summary: {
          total,
          mentionRate: total > 0 ? (mentioned / total) * 100 : 0,
          avgMentionRank: avgRank,
          avgSentiment,
          competitorCounts,
        },
      },
    })

    log.info('Simulation completed', {
      jobId,
      total,
      mentionRate: total > 0 ? mentioned / total : 0,
      durationMs: Date.now() - start,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Simulation failed'
    log.error('Simulation failed', { jobId, error: message })
    await prisma.simulationJob.update({
      where: { id: jobId },
      data: { status: 'failed', errorMessage: message },
    })
    throw err
  }
}

async function runSingleSimulation(
  jobId: string,
  projectId: string,
  prompt: string,
  provider: 'anthropic' | 'openai' | 'google',
  model: string,
  productName: string
): Promise<void> {
  try {
    const llmResponse = await callLLM(prompt, { provider, model, maxTokens: 1024 })
    const analysis = await analyzeSimulationResponse(llmResponse.text, productName)

    await prisma.simulationResult.create({
      data: {
        jobId,
        projectId,
        prompt,
        llmProvider: provider,
        llmModel: model,
        responseText: llmResponse.text,
        productMentioned: analysis.productMentioned,
        mentionRank: analysis.mentionRank,
        mentionContext: analysis.mentionContext,
        sentimentScore: analysis.sentimentScore,
        confidenceScore: analysis.confidenceScore,
        entitiesMentioned: analysis.entitiesMentioned,
        competitorsMentioned: analysis.competitorsMentioned,
        citations: analysis.citations,
        latencyMs: llmResponse.latencyMs,
      },
    })
  } catch (err) {
    log.warn('Single simulation task failed', {
      jobId,
      provider,
      model,
      prompt: prompt.slice(0, 80),
      error: err instanceof Error ? err.message : String(err),
    })
    await prisma.simulationResult.create({
      data: {
        jobId,
        projectId,
        prompt,
        llmProvider: provider,
        llmModel: model,
        responseText: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        productMentioned: false,
        sentimentScore: 0,
        confidenceScore: 0,
        entitiesMentioned: [],
        competitorsMentioned: [],
        citations: [],
        latencyMs: 0,
      },
    })
  }
}

interface ResponseAnalysis {
  productMentioned: boolean
  mentionRank: number | null
  mentionContext: string | null
  sentimentScore: number
  confidenceScore: number
  entitiesMentioned: string[]
  competitorsMentioned: string[]
  citations: string[]
}

async function analyzeSimulationResponse(
  responseText: string,
  productName: string
): Promise<ResponseAnalysis> {
  const { callClaudeJSON } = await import('./anthropic')

  try {
    return await callClaudeJSON<ResponseAnalysis>(
      `Analyze this AI model response for mentions of "${productName}":

RESPONSE: ${responseText.slice(0, 3000)}

Determine:
1. Is "${productName}" mentioned? (boolean)
2. If mentioned, what rank/position (1=first recommendation, null if not mentioned)
3. The exact text context around the mention (or null)
4. Sentiment toward "${productName}" from -1.0 to 1.0
5. Confidence score 0.0-1.0
6. List of all brands/products/tools mentioned
7. List of competitor products (not "${productName}")
8. List of any URLs/citations

Respond with JSON:
{
  "productMentioned": true,
  "mentionRank": 1,
  "mentionContext": "...snippet...",
  "sentimentScore": 0.5,
  "confidenceScore": 0.8,
  "entitiesMentioned": ["..."],
  "competitorsMentioned": ["..."],
  "citations": ["url1"]
}`,
      'You analyze AI responses for product visibility research.'
    )
  } catch (err) {
    log.warn('analyzeSimulationResponse fallback to string search', {
      error: err instanceof Error ? err.message : String(err),
    })
    const mentioned = responseText.toLowerCase().includes(productName.toLowerCase())
    return {
      productMentioned: mentioned,
      mentionRank: mentioned ? 1 : null,
      mentionContext: null,
      sentimentScore: 0,
      confidenceScore: mentioned ? 0.5 : 0,
      entitiesMentioned: [],
      competitorsMentioned: [],
      citations: [],
    }
  }
}
