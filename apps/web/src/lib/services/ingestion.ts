import * as cheerio from 'cheerio'
import { callClaudeJSON } from './anthropic'
import { logger } from '../logger'

const log = logger('ingestion')

export interface IngestedContent {
  title: string
  rawText: string
  wordCount: number
  metadata: Record<string, unknown>
  entities: string[]
  topics: string[]
  sentiment: number
}

// ─── URL Ingestion ────────────────────────────────────────────────────────────

export async function ingestUrl(url: string): Promise<IngestedContent> {
  log.info('Ingesting URL', { url })
  const response = await fetch(url, {
    headers: { 'User-Agent': 'GAEO-Bot/1.0 (AI Visibility Optimizer)' },
    signal: AbortSignal.timeout(30000),
  })

  if (!response.ok) {
    log.error('Failed to fetch URL', { url, status: response.status })
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  $('script, style, nav, footer, header, .cookie-banner, #cookie-notice, .advertisement').remove()

  const title = $('title').text().trim() || $('h1').first().text().trim() || url
  const rawText = $('body').text().replace(/\s+/g, ' ').trim()
  const wordCount = rawText.split(/\s+/).filter(Boolean).length

  const metadata: Record<string, unknown> = {
    url,
    description: $('meta[name="description"]').attr('content') || '',
    ogTitle: $('meta[property="og:title"]').attr('content') || '',
    ogDescription: $('meta[property="og:description"]').attr('content') || '',
    canonical: $('link[rel="canonical"]').attr('href') || '',
  }

  const analysis = await analyzeContent(rawText.slice(0, 8000))
  log.info('URL ingested', { url, wordCount, entities: analysis.entities.length })

  return { title, rawText, wordCount, metadata, entities: analysis.entities, topics: analysis.topics, sentiment: analysis.sentiment }
}

// ─── File Ingestion ───────────────────────────────────────────────────────────

export async function ingestPdf(buffer: Buffer): Promise<IngestedContent> {
  log.info('Ingesting PDF', { bytes: buffer.length })
  const pdfParse = await import('pdf-parse')
  const data = await pdfParse.default(buffer)
  const rawText = data.text.replace(/\s+/g, ' ').trim()
  const wordCount = rawText.split(/\s+/).filter(Boolean).length
  const analysis = await analyzeContent(rawText.slice(0, 8000))
  log.info('PDF ingested', { pages: data.numpages, wordCount })

  return {
    title: data.info?.Title || 'Untitled PDF',
    rawText,
    wordCount,
    metadata: { pages: data.numpages, author: data.info?.Author, creator: data.info?.Creator },
    entities: analysis.entities,
    topics: analysis.topics,
    sentiment: analysis.sentiment,
  }
}

export async function ingestDocx(buffer: Buffer, filename?: string): Promise<IngestedContent> {
  log.info('Ingesting DOCX', { bytes: buffer.length })
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  const rawText = result.value.replace(/\s+/g, ' ').trim()
  const wordCount = rawText.split(/\s+/).filter(Boolean).length
  const analysis = await analyzeContent(rawText.slice(0, 8000))
  const title = filename?.replace(/\.[^/.]+$/, '') || 'Untitled Document'
  log.info('DOCX ingested', { title, wordCount })

  return { title, rawText, wordCount, metadata: { filename }, entities: analysis.entities, topics: analysis.topics, sentiment: analysis.sentiment }
}

export async function ingestText(text: string, filename?: string): Promise<IngestedContent> {
  log.info('Ingesting text', { filename, bytes: text.length })
  const rawText = text.trim()
  const wordCount = rawText.split(/\s+/).filter(Boolean).length
  const analysis = await analyzeContent(rawText.slice(0, 8000))
  log.info('Text ingested', { filename, wordCount })

  return {
    title: filename || 'Untitled Text',
    rawText,
    wordCount,
    metadata: { filename },
    entities: analysis.entities,
    topics: analysis.topics,
    sentiment: analysis.sentiment,
  }
}

// ─── Sitemap Crawl ────────────────────────────────────────────────────────────

export async function fetchSitemapUrls(sitemapUrl: string): Promise<string[]> {
  log.info('Fetching sitemap', { sitemapUrl })
  const response = await fetch(sitemapUrl)
  const xml = await response.text()
  const $ = cheerio.load(xml, { xmlMode: true })
  const urls: string[] = []
  $('loc').each((_, el) => {
    const url = $(el).text().trim()
    if (url) urls.push(url)
  })
  const limited = urls.slice(0, 50)
  log.info('Sitemap fetched', { sitemapUrl, totalUrls: urls.length, limited: limited.length })
  return limited
}

// ─── Content Analysis ─────────────────────────────────────────────────────────

async function analyzeContent(text: string): Promise<{
  entities: string[]
  topics: string[]
  sentiment: number
}> {
  try {
    return await callClaudeJSON<{ entities: string[]; topics: string[]; sentiment: number }>(
      `Analyze this text and extract:
1. Named entities (brands, products, people, organizations) as a JSON array of strings
2. Main topics/themes as a JSON array of strings (max 10)
3. Sentiment score from -1.0 (very negative) to 1.0 (very positive) as a float

Text: ${text}

Respond with JSON: {"entities": [...], "topics": [...], "sentiment": 0.0}`,
      'You are a content analysis expert. Extract structured information from text.'
    )
  } catch (err) {
    log.warn('Content analysis failed, returning empty', { error: err instanceof Error ? err.message : String(err) })
    return { entities: [], topics: [], sentiment: 0 }
  }
}
