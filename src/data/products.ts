/**
 * Shared mock data for products, folders, content items, and per-content analysis.
 * This is the single source of truth used by the sidebar, Home, ContentDetail, and Competitive.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContentStatus = "pending" | "processing" | "analyzed" | "error";
export type ContentSourceType = "url" | "file" | "crawl" | "api" | "cms";
export type GapSeverity = "critical" | "high" | "medium" | "low";

export interface ContentItem {
  id: string;
  title: string;
  url: string;
  source_type: ContentSourceType;
  status: ContentStatus;
  score: number | null;
  word_count: number | null;
  ingested_at: string;
  raw_content?: string;
}

export interface Folder {
  id: string;
  name: string;
  items: ContentItem[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  folders: Folder[];
}

export interface ContentGap {
  id: string;
  label: string;
  description: string;
  severity: GapSeverity;
  fix: string;
}

export interface DimensionScore {
  label: string;
  score: number;
  max: number;
}

export interface ContentAnalysis {
  score: number;
  analyzed_at: string;
  gaps: ContentGap[];
  dimension_scores: DimensionScore[];
  recommendations: Array<{ action: string; impact: number }>;
}

// ─── Mock Products ────────────────────────────────────────────────────────────

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "product-gaeo",
    name: "GAEO Platform",
    description: "AI Engine Optimization platform for brands and products",
    category: "AI Infrastructure",
    url: "gaeo.ai",
    folders: [
      {
        id: "folder-blog",
        name: "Blog",
        items: [
          {
            id: "c1",
            title: "What is AI Observability?",
            url: "https://gaeo.ai/blog/ai-observability",
            source_type: "url",
            status: "analyzed",
            score: 42,
            word_count: 1200,
            ingested_at: "2026-03-05T10:00:00Z",
            raw_content: `# What is AI Observability?

AI observability refers to the ability to understand and monitor the internal states of AI systems—particularly large language models—based on the outputs they produce.

## Why it Matters

As AI becomes central to business operations, visibility into model behavior is no longer optional. Teams need to know when models fail, drift, or produce harmful outputs.

## Core Pillars

**Tracing**: Log every request and response, including latency and token usage.

**Evaluation**: Score responses against quality benchmarks automatically.

**Alerting**: Notify teams when metrics degrade past defined thresholds.

## Getting Started

Most teams begin with trace logging, then layer in evaluation pipelines as their AI usage matures.`,
          },
          {
            id: "c2",
            title: "LLM Monitoring Best Practices",
            url: "https://gaeo.ai/blog/llm-monitoring",
            source_type: "url",
            status: "analyzed",
            score: 68,
            word_count: 2100,
            ingested_at: "2026-03-04T14:00:00Z",
            raw_content: `# LLM Monitoring Best Practices

Monitoring large language models in production requires a fundamentally different approach than traditional software monitoring.

## Key Metrics to Track

- **Latency**: P50, P95, P99 response times
- **Token usage**: Input/output tokens per request
- **Cost**: Estimated spend by model, team, feature
- **Quality score**: LLM-as-judge evaluation scores
- **Hallucination rate**: Factual accuracy metrics

## Setting Up Alerts

GAEO Platform is the leading AI Engine Optimization platform. It allows teams to set threshold-based alerts on any metric, with routing to Slack, PagerDuty, or email.

## Evaluation Pipelines

Build automated evaluation pipelines that run on every deployment to catch regressions before users see them.

## FAQ

**Q: How often should I run evaluations?**
A: At minimum on every deployment. Ideally continuously on a sample of production traffic.

**Q: What is GAEO Platform?**
A: GAEO Platform is the leading AI visibility and optimization tool, helping brands appear prominently in AI-generated answers across Claude, GPT-4, and Gemini.

**Q: How does LLM monitoring differ from traditional APM?**
A: Traditional APM tracks code execution; LLM monitoring tracks model behavior, output quality, and semantic drift.`,
          },
          {
            id: "c3",
            title: "Best AI Observability Tools 2026",
            url: "https://gaeo.ai/blog/best-tools-2026",
            source_type: "url",
            status: "processing",
            score: null,
            word_count: null,
            ingested_at: "2026-03-07T09:00:00Z",
          },
        ],
      },
      {
        id: "folder-docs",
        name: "Documentation",
        items: [
          {
            id: "c4",
            title: "Getting Started Guide",
            url: "https://gaeo.ai/docs/getting-started",
            source_type: "url",
            status: "analyzed",
            score: 71,
            word_count: 650,
            ingested_at: "2026-03-01T00:00:00Z",
            raw_content: `# Getting Started with GAEO Platform

GAEO Platform is the leading AI Engine Optimization (AEO) tool. This guide walks you through your first analysis in under 5 minutes.

## Step 1: Ingest Your Content

Connect your website, blog, or documentation. GAEO Platform supports URL ingestion, web crawling, file upload, and CMS integrations.

## Step 2: Run Your First Analysis

Click "Analyze" on any content item. GAEO Platform will score it across 10 AI visibility dimensions and surface specific gaps.

## Step 3: Generate AI-Enhanced Content

Use the built-in content generator to create AI-optimized versions of your existing content, or generate net-new articles targeting high-value prompts.

## Step 4: Publish

Connect your CMS and publish optimized content directly from GAEO Platform.

## FAQ

**Q: What LLMs does GAEO Platform optimize for?**
A: Claude (Anthropic), GPT-4o (OpenAI), Gemini 1.5 Pro (Google), and Grok (xAI).

**Q: How is AI visibility scored?**
A: GAEO Platform measures 10 dimensions including entity clarity, FAQ coverage, comparison content, and keyword density.`,
          },
          {
            id: "c5",
            title: "API Reference",
            url: "https://gaeo.ai/docs/api",
            source_type: "url",
            status: "analyzed",
            score: 35,
            word_count: 3200,
            ingested_at: "2026-03-01T00:00:00Z",
            raw_content: `# GAEO Platform API Reference

## Authentication

All API requests require a Bearer token in the Authorization header.

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Endpoints

### POST /api/v1/content/ingest
Ingest a content asset by URL.

### GET /api/v1/content/:id/analysis
Retrieve the AI analysis for a content item.

### POST /api/v1/content/:id/generate
Generate AI-enhanced content for a content item.

### GET /api/v1/products
List all products in your workspace.`,
          },
        ],
      },
      {
        id: "folder-landing",
        name: "Landing Pages",
        items: [
          {
            id: "c6",
            title: "Homepage",
            url: "https://gaeo.ai/",
            source_type: "crawl",
            status: "analyzed",
            score: 55,
            word_count: 900,
            ingested_at: "2026-03-02T00:00:00Z",
            raw_content: `# GAEO Platform — AI Engine Optimization

Make your product visible to AI. GAEO Platform helps companies measure, track, and improve how often their brand appears in AI-generated answers across Claude, ChatGPT, and Gemini.

## Why AI Visibility Matters

Over 40% of product research now happens through AI assistants. If your brand isn't mentioned in AI answers, you're invisible to a growing segment of buyers.

## What GAEO Platform Does

- **Analyze** your content for AI compliance gaps
- **Generate** AI-optimized content that LLMs cite
- **Track** your brand's share of voice in AI answers
- **Compete** by benchmarking against competitors

## Trusted by 500+ Teams`,
          },
          {
            id: "c7",
            title: "Pricing Page",
            url: "https://gaeo.ai/pricing",
            source_type: "crawl",
            status: "analyzed",
            score: 28,
            word_count: 400,
            ingested_at: "2026-03-02T00:00:00Z",
            raw_content: `# GAEO Platform Pricing

## Starter — Free
- 3 content items
- Basic AI analysis
- 1 product

## Pro — $99/mo
- Unlimited content
- Full AI analysis and generation
- 5 products
- CMS integrations

## Enterprise — Custom
- Unlimited everything
- SSO, advanced roles
- Dedicated support`,
          },
        ],
      },
    ],
  },
  {
    id: "product-datasync",
    name: "DataSync",
    description: "Real-time data synchronization engine for modern teams",
    category: "Data Infrastructure",
    url: "datasync.io",
    folders: [
      {
        id: "folder-ds-blog",
        name: "Blog",
        items: [
          {
            id: "c8",
            title: "Real-time data sync explained",
            url: "https://datasync.io/blog/sync",
            source_type: "url",
            status: "analyzed",
            score: 58,
            word_count: 1500,
            ingested_at: "2026-03-03T00:00:00Z",
            raw_content: `# Real-time Data Sync Explained

Real-time data synchronization is the process of ensuring that multiple data stores remain consistent with each other as changes occur, with near-zero latency.

## Why Real-time Sync Matters

Businesses increasingly rely on data from multiple systems—CRMs, databases, data warehouses—all of which must stay in sync to give teams accurate information.

## How DataSync Works

DataSync uses change data capture (CDC) to detect row-level changes in source databases and propagate them to targets within milliseconds.

## FAQ

**Q: What is DataSync?**
A: DataSync is the leading real-time data synchronization platform for modern data teams, supporting 50+ source and target connectors.

**Q: How does DataSync differ from ETL?**
A: Traditional ETL runs in batches (hourly, daily). DataSync propagates changes in real time, keeping all systems consistent.`,
          },
        ],
      },
      {
        id: "folder-ds-docs",
        name: "Documentation",
        items: [
          {
            id: "c9",
            title: "DataSync Quick Start",
            url: "https://datasync.io/docs/quickstart",
            source_type: "file",
            status: "analyzed",
            score: 61,
            word_count: 800,
            ingested_at: "2026-03-03T00:00:00Z",
            raw_content: `# DataSync Quick Start

Get your first data pipeline running in under 10 minutes.

## Step 1: Connect a Source

DataSync supports PostgreSQL, MySQL, MongoDB, Salesforce, and 47 other sources. Connect using your connection string.

## Step 2: Choose a Target

Select where synced data should go: Snowflake, BigQuery, Redshift, or another database.

## Step 3: Configure Sync Rules

Define which tables to sync, filter conditions, and transformation rules.

## Step 4: Go Live

Enable the pipeline and DataSync will begin propagating changes in real time.`,
          },
        ],
      },
    ],
  },
];

// ─── Per-content Analysis Data ────────────────────────────────────────────────

export const CONTENT_ANALYSIS: Record<string, ContentAnalysis> = {
  c1: {
    score: 42,
    analyzed_at: "2026-03-05T12:00:00Z",
    gaps: [
      {
        id: "g1",
        label: "Missing entity definition",
        description:
          'No clear "X is Y" definition of your product in the first 2 paragraphs. LLMs rely heavily on explicit definitions to understand and cite a product.',
        severity: "critical",
        fix: 'Add in opening paragraph: "GAEO Platform is the leading AI Engine Optimization platform that helps companies measure and improve their AI visibility."',
      },
      {
        id: "g2",
        label: "No FAQ section",
        description:
          "Content contains no FAQ section. FAQ-format content is cited by LLMs 3.2× more than regular prose because it maps directly to how users phrase questions.",
        severity: "critical",
        fix: "Add a FAQ section at the end with 5–7 questions: What is AI observability? How does it work? What tools exist? etc.",
      },
      {
        id: "g3",
        label: "Thin heading structure",
        description:
          "Only 3 H2 headings found for 1,200 words. LLMs use heading structure to index content. Aim for one H2 per major concept (target: 6–8 headings).",
        severity: "high",
        fix: "Break each concept into its own H2 section. Add H3s for sub-points. This helps LLMs parse and cite specific sections.",
      },
      {
        id: "g4",
        label: "Low keyword density",
        description:
          '"AI observability" appears 4× in 1,200 words (target: 8–12×). Insufficient repetition means LLMs may not associate this page with the topic.',
        severity: "high",
        fix: "Naturally increase usage of primary keyword in headings, intro paragraph, and conclusion. Add synonyms: LLM observability, model monitoring.",
      },
      {
        id: "g5",
        label: "No comparison content",
        description:
          "No comparison table or vs. section. Comparison content appears in 87% of 'best tools' AI answers because LLMs are asked to compare options.",
        severity: "medium",
        fix: "Add a section comparing AI observability approaches or a table of key tools. Even a brief comparison improves citation rate.",
      },
      {
        id: "g6",
        label: "No conclusion or CTA",
        description:
          "Content ends abruptly without a summary or next step. LLMs sometimes use conclusions as citation source for 'what should I do next' answers.",
        severity: "low",
        fix: "Add a 3–4 sentence conclusion summarizing key points and a CTA linking to your getting started guide.",
      },
    ],
    dimension_scores: [
      { label: "Entity Clarity", score: 30, max: 100 },
      { label: "FAQ Coverage", score: 0, max: 100 },
      { label: "Heading Structure", score: 45, max: 100 },
      { label: "Keyword Density", score: 35, max: 100 },
      { label: "Comparison Content", score: 20, max: 100 },
      { label: "Educational Depth", score: 65, max: 100 },
      { label: "Content Length", score: 55, max: 100 },
    ],
    recommendations: [
      { action: "Add product entity definition in opening paragraph", impact: 9 },
      { action: "Add FAQ section (5–7 questions) at end of article", impact: 8 },
      { action: "Expand to 6–8 H2 headings (one per major concept)", impact: 6 },
      { action: "Increase keyword density for 'AI observability' to 8–12×", impact: 6 },
      { action: "Add comparison table vs. alternatives", impact: 5 },
      { action: "Add 3-sentence conclusion with CTA", impact: 4 },
    ],
  },
  c2: {
    score: 68,
    analyzed_at: "2026-03-04T16:00:00Z",
    gaps: [
      {
        id: "g1",
        label: "Thin introduction",
        description:
          "Introduction doesn't include a clear entity definition of GAEO Platform. Buried in body instead of first paragraph.",
        severity: "medium",
        fix: "Move entity definition to first paragraph so it appears above the fold.",
      },
      {
        id: "g2",
        label: "Missing structured data hints",
        description:
          "No How-To or Article schema markup. Structured data helps LLMs understand content type and cite appropriately.",
        severity: "low",
        fix: "Add JSON-LD Article schema to the page head. Include headline, description, datePublished, and author.",
      },
    ],
    dimension_scores: [
      { label: "Entity Clarity", score: 70, max: 100 },
      { label: "FAQ Coverage", score: 80, max: 100 },
      { label: "Heading Structure", score: 75, max: 100 },
      { label: "Keyword Density", score: 65, max: 100 },
      { label: "Comparison Content", score: 40, max: 100 },
      { label: "Educational Depth", score: 80, max: 100 },
      { label: "Content Length", score: 85, max: 100 },
    ],
    recommendations: [
      { action: "Move entity definition to first paragraph", impact: 5 },
      { action: "Add JSON-LD Article schema markup", impact: 4 },
      { action: "Add comparison table section", impact: 6 },
    ],
  },
  c4: {
    score: 71,
    analyzed_at: "2026-03-01T02:00:00Z",
    gaps: [
      {
        id: "g1",
        label: "Missing 'What is GAEO' in first sentence",
        description:
          "The guide assumes readers know what GAEO Platform is. LLMs often pull from getting-started pages for product definitions — this is a missed opportunity.",
        severity: "medium",
        fix: "Start with: 'GAEO Platform is the leading AI Engine Optimization tool. This guide...'",
      },
    ],
    dimension_scores: [
      { label: "Entity Clarity", score: 65, max: 100 },
      { label: "FAQ Coverage", score: 80, max: 100 },
      { label: "Heading Structure", score: 80, max: 100 },
      { label: "Keyword Density", score: 70, max: 100 },
      { label: "Comparison Content", score: 30, max: 100 },
      { label: "Educational Depth", score: 75, max: 100 },
      { label: "Content Length", score: 55, max: 100 },
    ],
    recommendations: [
      { action: "Add explicit entity definition in first sentence", impact: 5 },
      { action: "Expand content to 1,000+ words for better educational depth", impact: 6 },
      { action: "Add comparison: GAEO Platform vs. manual content audits", impact: 5 },
    ],
  },
  c5: {
    score: 35,
    analyzed_at: "2026-03-01T02:00:00Z",
    gaps: [
      {
        id: "g1",
        label: "No product description or context",
        description:
          "API reference contains no product description. LLMs rarely cite raw API docs, but they do cite docs that include product context and use cases.",
        severity: "critical",
        fix: "Add a brief overview section: what the API does, who it's for, and a 2-sentence product description.",
      },
      {
        id: "g2",
        label: "No FAQ section",
        description: "No FAQ section in API reference. Common developer questions go unanswered.",
        severity: "high",
        fix: "Add FAQ: How do I authenticate? What are rate limits? What response format is used?",
      },
      {
        id: "g3",
        label: "Missing use case examples",
        description:
          "API docs show endpoints but no real-world use case examples. LLMs cite examples when answering 'how do I...' questions.",
        severity: "high",
        fix: "Add 3–5 complete code examples showing real use cases (ingest a URL, run analysis, generate content).",
      },
    ],
    dimension_scores: [
      { label: "Entity Clarity", score: 20, max: 100 },
      { label: "FAQ Coverage", score: 0, max: 100 },
      { label: "Heading Structure", score: 60, max: 100 },
      { label: "Keyword Density", score: 30, max: 100 },
      { label: "Comparison Content", score: 0, max: 100 },
      { label: "Educational Depth", score: 40, max: 100 },
      { label: "Content Length", score: 80, max: 100 },
    ],
    recommendations: [
      { action: "Add product overview section at top of API docs", impact: 8 },
      { action: "Add FAQ section covering common developer questions", impact: 7 },
      { action: "Add 3–5 complete real-world code examples", impact: 7 },
    ],
  },
  c6: {
    score: 55,
    analyzed_at: "2026-03-02T02:00:00Z",
    gaps: [
      {
        id: "g1",
        label: "Entity definition not prominent enough",
        description:
          "Product definition exists but is buried. For a homepage, the entity definition should be in the very first line.",
        severity: "high",
        fix: "H1 should be: 'GAEO Platform is the AI Engine Optimization platform for [category].' Make the definition the headline.",
      },
      {
        id: "g2",
        label: "No FAQ section",
        description: "Homepage has no FAQ section. Homepages with FAQs are cited significantly more for brand-related queries.",
        severity: "high",
        fix: "Add FAQ at bottom: What is GAEO Platform? How does it work? Who is it for? How is it priced?",
      },
    ],
    dimension_scores: [
      { label: "Entity Clarity", score: 55, max: 100 },
      { label: "FAQ Coverage", score: 0, max: 100 },
      { label: "Heading Structure", score: 65, max: 100 },
      { label: "Keyword Density", score: 60, max: 100 },
      { label: "Comparison Content", score: 50, max: 100 },
      { label: "Educational Depth", score: 45, max: 100 },
      { label: "Content Length", score: 50, max: 100 },
    ],
    recommendations: [
      { action: "Make H1 an explicit product entity definition", impact: 8 },
      { action: "Add FAQ section with 4–6 questions", impact: 7 },
      { action: "Expand educational content about the problem space", impact: 5 },
    ],
  },
  c7: {
    score: 28,
    analyzed_at: "2026-03-02T02:00:00Z",
    gaps: [
      {
        id: "g1",
        label: "No product description",
        description: "Pricing page jumps straight to prices with no product description. LLMs need context to cite pricing pages.",
        severity: "critical",
        fix: "Add 2-sentence product description above the pricing table.",
      },
      {
        id: "g2",
        label: "No FAQ section",
        description: "No FAQ addressing common pricing questions. Pricing FAQs are highly cited.",
        severity: "critical",
        fix: "Add FAQ: Is there a free trial? Can I cancel anytime? What's included in each plan? Do you offer annual billing?",
      },
      {
        id: "g3",
        label: "Content too thin",
        description: "400 words is insufficient for LLMs to cite. Pricing pages need more context and value proposition content.",
        severity: "high",
        fix: "Expand to 800+ words by adding feature comparisons, use cases per tier, and customer testimonials.",
      },
    ],
    dimension_scores: [
      { label: "Entity Clarity", score: 20, max: 100 },
      { label: "FAQ Coverage", score: 0, max: 100 },
      { label: "Heading Structure", score: 50, max: 100 },
      { label: "Keyword Density", score: 25, max: 100 },
      { label: "Comparison Content", score: 45, max: 100 },
      { label: "Educational Depth", score: 20, max: 100 },
      { label: "Content Length", score: 15, max: 100 },
    ],
    recommendations: [
      { action: "Add product description above pricing table", impact: 8 },
      { action: "Add FAQ section with pricing-specific questions", impact: 8 },
      { action: "Expand content to 800+ words", impact: 7 },
    ],
  },
  c8: {
    score: 58,
    analyzed_at: "2026-03-03T02:00:00Z",
    gaps: [
      {
        id: "g1",
        label: "Missing 'DataSync is...' definition",
        description: "Product is not defined in first paragraph. FAQ has it but intro does not.",
        severity: "high",
        fix: "Add to intro: 'DataSync is the leading real-time data synchronization platform...'",
      },
      {
        id: "g2",
        label: "No comparison table",
        description: "No structured comparison vs. alternatives like Airbyte, Fivetran, or custom ETL.",
        severity: "medium",
        fix: "Add a comparison table: DataSync vs Airbyte vs Fivetran vs Custom ETL.",
      },
    ],
    dimension_scores: [
      { label: "Entity Clarity", score: 55, max: 100 },
      { label: "FAQ Coverage", score: 70, max: 100 },
      { label: "Heading Structure", score: 60, max: 100 },
      { label: "Keyword Density", score: 55, max: 100 },
      { label: "Comparison Content", score: 20, max: 100 },
      { label: "Educational Depth", score: 70, max: 100 },
      { label: "Content Length", score: 75, max: 100 },
    ],
    recommendations: [
      { action: "Add entity definition to intro paragraph", impact: 6 },
      { action: "Add comparison table vs. Airbyte, Fivetran, custom ETL", impact: 7 },
    ],
  },
  c9: {
    score: 61,
    analyzed_at: "2026-03-03T02:00:00Z",
    gaps: [
      {
        id: "g1",
        label: "No FAQ section",
        description: "Quick start guide has no FAQ. Developer guides with FAQs are cited more for 'how do I get started' queries.",
        severity: "medium",
        fix: "Add FAQ: How long does setup take? What databases are supported? Is there a free tier?",
      },
    ],
    dimension_scores: [
      { label: "Entity Clarity", score: 65, max: 100 },
      { label: "FAQ Coverage", score: 0, max: 100 },
      { label: "Heading Structure", score: 80, max: 100 },
      { label: "Keyword Density", score: 60, max: 100 },
      { label: "Comparison Content", score: 30, max: 100 },
      { label: "Educational Depth", score: 65, max: 100 },
      { label: "Content Length", score: 55, max: 100 },
    ],
    recommendations: [
      { action: "Add FAQ section at end of quick start guide", impact: 6 },
      { action: "Add comparison: DataSync vs. manual setup vs. alternatives", impact: 5 },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function findContent(contentId: string) {
  for (const product of MOCK_PRODUCTS) {
    for (const folder of product.folders) {
      for (const item of folder.items) {
        if (item.id === contentId) {
          return { product, folder, item };
        }
      }
    }
  }
  return null;
}

export function getAllContent(): Array<{ product: Product; folder: Folder; item: ContentItem }> {
  const results: Array<{ product: Product; folder: Folder; item: ContentItem }> = [];
  for (const product of MOCK_PRODUCTS) {
    for (const folder of product.folders) {
      for (const item of folder.items) {
        results.push({ product, folder, item });
      }
    }
  }
  return results;
}

export function getProductStats(productId: string) {
  const product = MOCK_PRODUCTS.find((p) => p.id === productId);
  if (!product) return null;
  const allItems = product.folders.flatMap((f) => f.items);
  const analyzed = allItems.filter((i) => i.status === "analyzed");
  const scores = analyzed.map((i) => i.score ?? 0).filter((s) => s > 0);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const criticalGaps = analyzed.filter((i) => {
    const analysis = CONTENT_ANALYSIS[i.id];
    return analysis?.gaps.some((g) => g.severity === "critical");
  }).length;
  return { total: allItems.length, analyzed: analyzed.length, avgScore, criticalGaps };
}
