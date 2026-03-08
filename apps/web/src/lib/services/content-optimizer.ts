import { anthropic } from './anthropic'

export interface GeneratedArticle {
  title: string
  metaDescription: string
  content: string
  wordCount: number
  targetPrompts: string[]
  suggestedSchema: string
}

export interface GeneratedFAQ {
  title: string
  faqs: Array<{ question: string; answer: string }>
  schemaMarkup: string
}

export interface GeneratedComparison {
  title: string
  intro: string
  comparisonTable: Array<{
    feature: string
    product: string
    competitor: string
    advantage: 'product' | 'competitor' | 'tie'
  }>
  conclusion: string
  verdict: string
}

export interface GeneratedEntityDef {
  entityName: string
  definition: string
  attributes: string[]
  relationships: string[]
  schema: string
}

// ─── Article Generator ────────────────────────────────────────────────────────

export async function generateArticle(params: {
  productName: string
  productDescription: string
  topic: string
  targetAudience: string
  targetPrompts: string[]
  tone?: string
}): Promise<GeneratedArticle> {
  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: `You are an expert content writer specializing in AI Engine Optimization (AEO).
Write content that is authoritative, educational, and structured to rank well in AI model responses.
Use clear headings (H2/H3), include specific examples, and naturally incorporate the product throughout.
Format output as JSON only.`,
    messages: [
      {
        role: 'user',
        content: `Write a comprehensive SEO/AEO-optimized article about:

PRODUCT: ${params.productName}
DESCRIPTION: ${params.productDescription}
TOPIC: ${params.topic}
TARGET AUDIENCE: ${params.targetAudience}
TARGET PROMPTS (queries this should rank for): ${params.targetPrompts.join(', ')}
TONE: ${params.tone || 'professional and educational'}

The article should:
- Have a compelling H1 title
- Include H2/H3 sections with practical information
- Naturally mention ${params.productName} as the solution
- Be 1200-1800 words
- Include a meta description

Respond with JSON:
{
  "title": "...",
  "metaDescription": "...",
  "content": "Full markdown article...",
  "wordCount": 1400,
  "targetPrompts": ["..."],
  "suggestedSchema": "JSON-LD schema markup string"
}`,
      },
    ],
  })

  const response = await stream.finalMessage()
  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'

  try {
    return JSON.parse(text) as GeneratedArticle
  } catch {
    return {
      title: `${params.topic} - Complete Guide`,
      metaDescription: `Learn about ${params.topic} with ${params.productName}`,
      content: text,
      wordCount: text.split(/\s+/).length,
      targetPrompts: params.targetPrompts,
      suggestedSchema: '',
    }
  }
}

// ─── FAQ Generator ────────────────────────────────────────────────────────────

export async function generateFAQ(params: {
  productName: string
  topic: string
  numQuestions?: number
}): Promise<GeneratedFAQ> {
  const n = params.numQuestions || 10
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: 'You are an AEO content expert. Generate FAQ content optimized for AI model responses. Respond with JSON only.',
    messages: [
      {
        role: 'user',
        content: `Generate ${n} FAQs about "${params.topic}" for "${params.productName}".

Questions should:
- Mirror real user queries to AI assistants
- Have concise, authoritative answers (2-4 sentences each)
- Naturally position ${params.productName} as the solution where relevant

Respond with JSON:
{
  "title": "Frequently Asked Questions about ${params.topic}",
  "faqs": [
    {"question": "...", "answer": "..."}
  ],
  "schemaMarkup": "JSON-LD FAQPage schema string"
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  return JSON.parse(text) as GeneratedFAQ
}

// ─── Comparison Generator ─────────────────────────────────────────────────────

export async function generateComparison(params: {
  productName: string
  competitorName: string
  productDescription: string
  features?: string[]
}): Promise<GeneratedComparison> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: 'You are an AEO content strategist. Create honest, data-driven comparison content. Respond with JSON only.',
    messages: [
      {
        role: 'user',
        content: `Create a detailed comparison between "${params.productName}" and "${params.competitorName}".

Product description: ${params.productDescription}
Features to compare: ${params.features?.join(', ') || 'pricing, features, ease of use, support, integrations'}

The comparison should be honest and highlight genuine advantages.

Respond with JSON:
{
  "title": "${params.productName} vs ${params.competitorName}: Complete Comparison",
  "intro": "...",
  "comparisonTable": [
    {
      "feature": "...",
      "product": "...",
      "competitor": "...",
      "advantage": "product|competitor|tie"
    }
  ],
  "conclusion": "...",
  "verdict": "..."
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  return JSON.parse(text) as GeneratedComparison
}

// ─── Entity Definition Generator ─────────────────────────────────────────────

export async function generateEntityDefinition(params: {
  entityName: string
  productName: string
  category: string
}): Promise<GeneratedEntityDef> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: 'You are an AEO entity optimization expert. Create structured entity definitions for AI model training signals. Respond with JSON only.',
    messages: [
      {
        role: 'user',
        content: `Create an authoritative entity definition for "${params.entityName}" as it relates to "${params.productName}" in the ${params.category} category.

This definition will be used to establish the entity in AI training data contexts.

Respond with JSON:
{
  "entityName": "${params.entityName}",
  "definition": "Authoritative 2-3 sentence definition...",
  "attributes": ["key attribute 1", "key attribute 2", ...],
  "relationships": ["related to X", "type of Y", ...],
  "schema": "JSON-LD Thing/SoftwareApplication schema"
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  return JSON.parse(text) as GeneratedEntityDef
}

// ─── Content Optimizer ────────────────────────────────────────────────────────

export async function optimizeContent(params: {
  content: string
  productName: string
  targetPrompts: string[]
}): Promise<{ optimizedContent: string; changes: string[]; scoreImpact: number }> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: 'You are an AEO content optimization expert. Improve content for AI discoverability. Respond with JSON only.',
    messages: [
      {
        role: 'user',
        content: `Optimize this content for AI Engine Optimization (AEO):

PRODUCT: ${params.productName}
TARGET PROMPTS: ${params.targetPrompts.join(', ')}

ORIGINAL CONTENT:
${params.content.slice(0, 6000)}

Improve the content to:
1. Better answer the target prompts
2. Strengthen entity clarity for ${params.productName}
3. Add structure (headings, lists) for AI comprehension
4. Include more authoritative statements
5. Add FAQ-style sections where appropriate

Respond with JSON:
{
  "optimizedContent": "...",
  "changes": ["Change 1: ...", "Change 2: ..."],
  "scoreImpact": 5
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'

  try {
    return JSON.parse(text)
  } catch {
    return {
      optimizedContent: params.content,
      changes: [],
      scoreImpact: 0,
    }
  }
}
