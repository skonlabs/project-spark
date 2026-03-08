import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface LLMMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface LLMResponse {
  text: string
  provider: string
  model: string
  latencyMs: number
}

// Unified interface for calling different LLM providers
export async function callLLM(
  prompt: string,
  options: {
    provider?: 'anthropic' | 'openai' | 'google'
    model?: string
    systemPrompt?: string
    maxTokens?: number
    temperature?: number
  } = {}
): Promise<LLMResponse> {
  const {
    provider = 'anthropic',
    model,
    systemPrompt,
    maxTokens = 2048,
    temperature = 0.7,
  } = options

  const start = Date.now()

  if (provider === 'anthropic') {
    const selectedModel = model || 'claude-sonnet-4-6'
    const response = await anthropic.messages.create({
      model: selectedModel,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return { text, provider: 'anthropic', model: selectedModel, latencyMs: Date.now() - start }
  }

  if (provider === 'openai') {
    // Dynamic import so OpenAI SDK is optional
    const selectedModel = model || 'gpt-4o'
    try {
      const { default: OpenAI } = await import('openai')
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const response = await client.chat.completions.create({
        model: selectedModel,
        messages: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
        max_tokens: maxTokens,
        temperature,
      })
      const text = response.choices[0]?.message?.content || ''
      return { text, provider: 'openai', model: selectedModel, latencyMs: Date.now() - start }
    } catch {
      throw new Error('OpenAI SDK not installed. Run: npm install openai')
    }
  }

  if (provider === 'google') {
    const selectedModel = model || 'gemini-1.5-pro'
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')
      const genModel = client.getGenerativeModel({ model: selectedModel })
      const result = await genModel.generateContent(prompt)
      const text = result.response.text()
      return { text, provider: 'google', model: selectedModel, latencyMs: Date.now() - start }
    } catch {
      throw new Error('Google AI SDK not installed. Run: npm install @google/generative-ai')
    }
  }

  throw new Error(`Unknown provider: ${provider}`)
}

// ─── JSON extraction helper ────────────────────────────────────────────────────

/**
 * Strips markdown code fences that Claude occasionally wraps around JSON
 * even when instructed not to.
 */
function extractJSON(raw: string): string {
  const trimmed = raw.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  if (fenced) return fenced[1].trim()
  return trimmed
}

export async function callClaudeJSON<T>(
  prompt: string,
  systemPrompt?: string,
  model = 'claude-sonnet-4-6'
): Promise<T> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt
      ? `${systemPrompt}\n\nAlways respond with valid JSON only. No markdown, no code fences, no explanation.`
      : 'Always respond with valid JSON only. No markdown, no code fences, no explanation.',
    messages: [{ role: 'user', content: prompt }],
  })
  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
  return JSON.parse(extractJSON(raw)) as T
}
