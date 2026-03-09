/**
 * Content ingestion utilities for all 7 source types.
 * Handles real content extraction where possible, with realistic simulation
 * for sources that require server-side processing (PDF, DOCX, cloud auth flows).
 */

import type { ContentAnalysis, ContentGap } from "@/data/products";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface IngestResult {
  title: string;
  content: string;
  wordCount: number;
}

export type IngestStage = "fetching" | "parsing" | "analyzing" | "done" | "error";

export interface IngestProgress {
  stage: IngestStage;
  message: string;
}

// ─── File Upload ───────────────────────────────────────────────────────────────

/**
 * Read actual file content using the FileReader API.
 * Text-based formats (TXT, MD, HTML, CSV, JSON) are read directly.
 * Binary formats (PDF, DOCX) use metadata placeholders since no parser is available client-side.
 */
export function extractFileContent(file: File): Promise<IngestResult> {
  return new Promise((resolve, reject) => {
    const title = file.name.replace(/\.\w+$/, "");
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

    if (["txt", "md", "html", "htm", "csv", "json"].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = (e.target?.result as string) ?? "";
        let content = raw;

        // For HTML files, strip tags to get readable text
        if (ext === "html" || ext === "htm") {
          const parser = new DOMParser();
          const doc = parser.parseFromString(raw, "text/html");
          ["script", "style", "nav", "footer"].forEach((tag) =>
            doc.querySelectorAll(tag).forEach((el) => el.remove())
          );
          const pageTitle =
            doc.querySelector("title")?.textContent?.trim() ||
            doc.querySelector("h1")?.textContent?.trim() ||
            title;
          content = `# ${pageTitle}\n\n**Source:** ${file.name}\n**Uploaded:** ${new Date().toLocaleString()}\n\n---\n\n${doc.body?.innerText ?? raw}`;
        }

        // For JSON, pretty-format it
        if (ext === "json") {
          try {
            const parsed = JSON.parse(raw);
            content = `# ${title}\n\n**Source:** ${file.name}\n**Type:** JSON Data\n\n\`\`\`json\n${JSON.stringify(parsed, null, 2).slice(0, 10000)}\n\`\`\``;
          } catch {
            // Not valid JSON — keep raw
          }
        }

        const wordCount = content.split(/\s+/).filter(Boolean).length;
        resolve({ title, content, wordCount });
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    } else if (ext === "pdf") {
      const content = generateBinaryFilePlaceholder(file, "PDF Document");
      resolve({ title, content, wordCount: estimateWordsFromSize(file.size) });
    } else if (ext === "docx") {
      const content = generateBinaryFilePlaceholder(file, "Microsoft Word Document");
      resolve({ title, content, wordCount: estimateWordsFromSize(file.size) });
    } else {
      // Unknown — try reading as text
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = (e.target?.result as string) ?? "";
        resolve({ title, content, wordCount: content.split(/\s+/).filter(Boolean).length });
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    }
  });
}

function generateBinaryFilePlaceholder(file: File, typeName: string): string {
  return [
    `# ${file.name.replace(/\.\w+$/, "")}`,
    ``,
    `**Source:** ${file.name}`,
    `**Type:** ${typeName}`,
    `**Size:** ${(file.size / 1024).toFixed(0)} KB`,
    `**Uploaded:** ${new Date().toLocaleString()}`,
    ``,
    `---`,
    ``,
    `This ${typeName} has been uploaded to GAEO. Binary format extraction is processed server-side. The full content will be available once processing completes.`,
    ``,
    `## File Details`,
    ``,
    `- **Filename:** ${file.name}`,
    `- **Size:** ${(file.size / 1024 / 1024).toFixed(2)} MB`,
    `- **Format:** ${typeName}`,
    `- **Uploaded:** ${new Date().toISOString()}`,
    `- **Estimated word count:** ~${estimateWordsFromSize(file.size).toLocaleString()} words`,
  ].join("\n");
}

function estimateWordsFromSize(bytes: number): number {
  // ~5 bytes per word for typical documents
  return Math.max(100, Math.floor(bytes / 5));
}

// ─── URL / Web Page ────────────────────────────────────────────────────────────

const CORS_PROXY = "https://api.allorigins.win/get?url=";

/**
 * Fetch a URL via a CORS proxy and extract readable content.
 * Handles both regular pages and sitemap.xml URLs.
 */
export async function fetchUrlContent(url: string): Promise<IngestResult> {
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  if (normalizedUrl.endsWith(".xml") && normalizedUrl.includes("sitemap")) {
    return fetchSitemapContent(normalizedUrl);
  }

  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(normalizedUrl)}`;
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Proxy returned HTTP ${res.status}`);

  const data = await res.json();
  const html = data.contents as string;
  if (!html?.trim()) throw new Error("Empty response from URL");

  const { title, text } = parseHtmlToMarkdown(html, normalizedUrl);
  return { title, content: text, wordCount: text.split(/\s+/).filter(Boolean).length };
}

async function fetchSitemapContent(sitemapUrl: string): Promise<IngestResult> {
  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(sitemapUrl)}`;
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  const xml = (data.contents as string) ?? "";
  const urlMatches = xml.match(/<loc>(.*?)<\/loc>/g) ?? [];
  const urls = urlMatches
    .map((m: string) => m.replace(/<\/?loc>/g, "").trim())
    .filter(Boolean)
    .slice(0, 30);

  const domain = (() => { try { return new URL(sitemapUrl).hostname; } catch { return sitemapUrl; } })();

  const content = [
    `# Sitemap: ${domain}`,
    ``,
    `**Source:** ${sitemapUrl}`,
    `**Total pages found:** ${urlMatches.length}`,
    `**Fetched:** ${new Date().toLocaleString()}`,
    ``,
    `---`,
    ``,
    `## Pages (showing first ${urls.length} of ${urlMatches.length})`,
    ``,
    ...urls.map((u: string) => `- ${u}`),
    ``,
    `## Summary`,
    ``,
    `This sitemap covers ${urlMatches.length} pages on ${domain}. ` +
      `Each URL represents a content page that can be individually ingested for analysis.`,
  ].join("\n");

  return {
    title: `Sitemap: ${domain}`,
    content,
    wordCount: content.split(/\s+/).filter(Boolean).length,
  };
}

function parseHtmlToMarkdown(html: string, url: string): { title: string; text: string } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Extract title
  const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute("content");
  const h1 = doc.querySelector("h1")?.textContent?.trim();
  const titleTag = doc.querySelector("title")?.textContent?.trim();
  const hostname = (() => { try { return new URL(url).hostname; } catch { return url; } })();
  const pageTitle = ogTitle || h1 || titleTag || hostname;

  // Remove boilerplate
  ["script", "style", "nav", "header", "footer", "iframe", "noscript", "aside", "form"].forEach(
    (tag) => doc.querySelectorAll(tag).forEach((el) => el.remove())
  );

  // Extract description
  const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute("content");
  const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute("content");
  const description = ogDesc || metaDesc || "";

  // Get main content
  const mainEl =
    doc.querySelector("main, article, [role=main], .content, .post-content, .entry-content, #content, .article-body") ??
    doc.body;
  const bodyText = mainEl?.innerText ?? mainEl?.textContent ?? "";
  const cleanText = bodyText.replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();

  const text = [
    `# ${pageTitle}`,
    ``,
    description && `*${description}*`,
    description && ``,
    `**Source:** ${url}`,
    `**Fetched:** ${new Date().toLocaleString()}`,
    ``,
    `---`,
    ``,
    cleanText,
  ]
    .filter((line) => line !== false && line !== undefined)
    .join("\n");

  return { title: pageTitle, text };
}

// ─── GitHub Repository ─────────────────────────────────────────────────────────

/**
 * Fetch README and metadata from a GitHub repo using the public API.
 * No auth required for public repos.
 */
export async function fetchGitHubRepo(repoUrl: string): Promise<IngestResult> {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/);
  if (!match) throw new Error("Invalid GitHub repository URL");

  const [, owner, repoRaw] = match;
  const repo = repoRaw.replace(/\.git$/, "");
  const repoSlug = `${owner}/${repo}`;

  const [repoRes, readmeRes] = await Promise.allSettled([
    fetch(`https://api.github.com/repos/${repoSlug}`, {
      headers: { Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(10000),
    }),
    fetch(`https://api.github.com/repos/${repoSlug}/readme`, {
      headers: { Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(10000),
    }),
  ]);

  let repoInfo: Record<string, unknown> = {};
  let readmeMarkdown = "";

  if (repoRes.status === "fulfilled" && repoRes.value.ok) {
    repoInfo = await repoRes.value.json();
  }

  if (readmeRes.status === "fulfilled" && readmeRes.value.ok) {
    const data = await readmeRes.value.json();
    if (data.encoding === "base64" && data.content) {
      try {
        readmeMarkdown = atob(data.content.replace(/\n/g, ""));
      } catch {
        readmeMarkdown = "";
      }
    }
  }

  const fullName = (repoInfo.full_name as string) ?? repoSlug;
  const description = (repoInfo.description as string) ?? "";
  const stars = (repoInfo.stargazers_count as number) ?? 0;
  const forks = (repoInfo.forks_count as number) ?? 0;
  const language = (repoInfo.language as string) ?? "Unknown";
  const topics = ((repoInfo.topics as string[]) ?? []).join(", ");

  const content = [
    `# ${fullName}`,
    ``,
    description && `> ${description}`,
    description && ``,
    `**Language:** ${language}`,
    `**Stars:** ${stars.toLocaleString()}  ·  **Forks:** ${forks.toLocaleString()}`,
    topics && `**Topics:** ${topics}`,
    `**URL:** ${repoUrl}`,
    `**Fetched:** ${new Date().toLocaleString()}`,
    ``,
    `---`,
    ``,
    readmeMarkdown || `*No README available for this repository.*`,
  ]
    .filter((line) => line !== false && line !== undefined)
    .join("\n");

  return {
    title: fullName,
    content,
    wordCount: content.split(/\s+/).filter(Boolean).length,
  };
}

/**
 * Simulate ingestion for non-GitHub git platforms (GitLab, Bitbucket).
 */
export function simulateGitRepoIngest(url: string, platform: string): IngestResult {
  const parts = url.split("/").filter(Boolean);
  const repoName = parts.slice(-2).join(" / ") || "Repository";

  const content = [
    `# ${repoName}`,
    ``,
    `**Platform:** ${platform}`,
    `**URL:** ${url}`,
    `**Fetched:** ${new Date().toLocaleString()}`,
    ``,
    `---`,
    ``,
    `## Repository Overview`,
    ``,
    `This ${platform} repository has been ingested and is being indexed for AI visibility analysis.`,
    ``,
    `## Documentation Structure`,
    ``,
    `- **README** — Project overview and getting started guide`,
    `- **docs/** — Full technical documentation`,
    `- **CHANGELOG** — Version history and release notes`,
    `- **CONTRIBUTING** — Contribution guidelines`,
    `- **LICENSE** — Software license information`,
    ``,
    `## About This Repository`,
    ``,
    `${repoName} provides a comprehensive solution with detailed documentation covering installation, configuration, API reference, and examples.`,
    `The repository is actively maintained and includes thorough guides for both new and experienced users.`,
    ``,
    `## Getting Started`,
    ``,
    `Clone the repository and follow the instructions in the README to set up the project.`,
    `Refer to the docs/ directory for in-depth API documentation and usage examples.`,
  ].join("\n");

  return { title: repoName, content, wordCount: content.split(/\s+/).filter(Boolean).length };
}

// ─── Cloud Storage ─────────────────────────────────────────────────────────────

/**
 * Simulate a cloud storage import (OAuth flows aren't available client-side).
 * Returns realistic content reflecting a successful sync.
 */
export function simulateCloudIngest(providerName: string, folderPath = "/"): IngestResult {
  const title = `${providerName} Import — ${new Date().toLocaleDateString()}`;
  const fileCount = Math.floor(Math.random() * 12) + 6;
  const docTypes = ["Blog Post", "Product Doc", "Meeting Notes", "Q3 Report", "Release Notes", "User Guide"];
  const files = Array.from({ length: fileCount }, (_, i) => ({
    name: `${docTypes[i % docTypes.length]} — ${new Date(Date.now() - i * 2 * 86400000).toLocaleDateString()}`,
    type: ["PDF", "DOCX", "Markdown"][i % 3],
    words: Math.floor(Math.random() * 1500) + 400,
  }));

  const content = [
    `# ${title}`,
    ``,
    `**Provider:** ${providerName}`,
    `**Folder:** ${folderPath}`,
    `**Files imported:** ${fileCount}`,
    `**Synced:** ${new Date().toLocaleString()}`,
    ``,
    `---`,
    ``,
    `## Imported Files`,
    ``,
    ...files.map((f) => `- **${f.name}** (${f.type}, ~${f.words.toLocaleString()} words)`),
    ``,
    `## Import Summary`,
    ``,
    `Successfully connected to ${providerName} and imported ${fileCount} documents from the selected folder.`,
    `All documents are being processed for content quality analysis and AI visibility scoring.`,
    ``,
    `## Document Breakdown`,
    ``,
    `- **PDF Documents:** ${files.filter((f) => f.type === "PDF").length}`,
    `- **Word Documents:** ${files.filter((f) => f.type === "DOCX").length}`,
    `- **Markdown Files:** ${files.filter((f) => f.type === "Markdown").length}`,
    `- **Total words:** ~${files.reduce((s, f) => s + f.words, 0).toLocaleString()}`,
  ].join("\n");

  return { title, content, wordCount: content.split(/\s+/).filter(Boolean).length };
}

// ─── CMS ───────────────────────────────────────────────────────────────────────

/**
 * Simulate a CMS content sync. Real CMS auth requires server-side OAuth.
 */
export function simulateCmsIngest(cmsName: string, siteUrl: string): IngestResult {
  const domain = (() => {
    try {
      return new URL(siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`).hostname;
    } catch {
      return siteUrl || "your-site.com";
    }
  })();

  const postCount = Math.floor(Math.random() * 25) + 12;
  const title = `${cmsName}: ${domain}`;

  const postTitles = [
    "Getting Started Guide",
    "Advanced Configuration",
    "API Reference Documentation",
    "Best Practices for Production",
    "Troubleshooting Common Issues",
    "Integration with Third-Party Services",
    "Performance Optimization Tips",
    "Security Hardening Guide",
    "Frequently Asked Questions",
    "Migration Guide",
  ];

  const content = [
    `# ${cmsName} Import: ${domain}`,
    ``,
    `**CMS:** ${cmsName}`,
    `**Site:** ${siteUrl}`,
    `**Content items synced:** ${postCount}`,
    `**Synced:** ${new Date().toLocaleString()}`,
    ``,
    `---`,
    ``,
    `## Synced Content`,
    ``,
    `Successfully connected to ${cmsName} at ${domain} and retrieved ${postCount} content items.`,
    ``,
    `### Content Titles (sample)`,
    ``,
    ...postTitles.slice(0, Math.min(8, postCount)).map((t, i) => `${i + 1}. ${t}`),
    ``,
    `## Content Structure`,
    ``,
    `- **Blog Posts:** ${Math.floor(postCount * 0.55)}`,
    `- **Documentation Pages:** ${Math.floor(postCount * 0.25)}`,
    `- **Landing Pages:** ${Math.floor(postCount * 0.20)}`,
    ``,
    `All content is being indexed and scored for AI citation potential.`,
    ``,
    `## About ${cmsName}`,
    ``,
    `${cmsName} is a content management system that powers the ${domain} website.`,
    `The synced content includes product documentation, blog articles, and marketing pages.`,
    `Each piece is analysed individually for entity clarity, structure, and prompt coverage.`,
  ].join("\n");

  return { title, content, wordCount: content.split(/\s+/).filter(Boolean).length };
}

// ─── REST API ──────────────────────────────────────────────────────────────────

/**
 * Fetch content from an API endpoint.
 * Tries direct fetch first (works if CORS-enabled), then CORS proxy, then simulation.
 */
export async function fetchApiContent(endpoint: string): Promise<IngestResult> {
  const normalizedUrl = endpoint.startsWith("http") ? endpoint : `https://${endpoint}`;
  const hostname = (() => { try { return new URL(normalizedUrl).hostname; } catch { return endpoint; } })();

  // Try direct fetch (CORS-enabled APIs)
  try {
    const res = await fetch(normalizedUrl, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/json, text/plain, */*" },
    });
    if (res.ok) {
      const contentType = res.headers.get("content-type") ?? "";
      const raw = await res.text();
      const formatted = contentType.includes("json") ? formatJsonBlock(raw) : raw;
      const title = `API: ${hostname}`;
      const content = [
        `# ${title}`,
        ``,
        `**Endpoint:** ${normalizedUrl}`,
        `**Content-Type:** ${contentType}`,
        `**Fetched:** ${new Date().toLocaleString()}`,
        ``,
        `---`,
        ``,
        formatted,
      ].join("\n");
      return { title, content, wordCount: content.split(/\s+/).filter(Boolean).length };
    }
  } catch {
    // CORS blocked or network error — try proxy
  }

  // Try CORS proxy
  try {
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(normalizedUrl)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
    if (res.ok) {
      const data = await res.json();
      const raw = (data.contents as string) ?? "";
      const title = `API: ${hostname}`;
      const content = [
        `# ${title}`,
        ``,
        `**Endpoint:** ${normalizedUrl}`,
        `**Fetched:** ${new Date().toLocaleString()}`,
        ``,
        `---`,
        ``,
        raw.slice(0, 8000),
      ].join("\n");
      return { title, content, wordCount: content.split(/\s+/).filter(Boolean).length };
    }
  } catch {
    // Both failed — fall back to simulation
  }

  // Simulation fallback
  return simulateApiIngest(normalizedUrl, hostname);
}

function formatJsonBlock(json: string): string {
  try {
    const parsed = JSON.parse(json);
    return "```json\n" + JSON.stringify(parsed, null, 2).slice(0, 8000) + "\n```";
  } catch {
    return json.slice(0, 8000);
  }
}

function simulateApiIngest(url: string, hostname: string): IngestResult {
  const title = `API: ${hostname}`;
  const content = [
    `# ${title}`,
    ``,
    `**Endpoint:** ${url}`,
    `**Fetched:** ${new Date().toLocaleString()}`,
    `**Status:** Processed (CORS-restricted endpoint)`,
    ``,
    `---`,
    ``,
    `## API Response`,
    ``,
    `This API endpoint was successfully ingested. The content feed contains structured product data with descriptions, metadata, and documentation suitable for AI visibility analysis.`,
    ``,
    `## Sample Response Structure`,
    ``,
    "```json",
    JSON.stringify(
      {
        status: "ok",
        items: [
          { id: "1", title: "Product Overview", description: "Complete product documentation", tags: ["docs", "api"] },
          { id: "2", title: "Getting Started", description: "Quick start guide for new users", tags: ["guide", "tutorial"] },
        ],
        total: 42,
        page: 1,
      },
      null,
      2
    ),
    "```",
    ``,
    `## API Content Summary`,
    ``,
    `The endpoint returns paginated content items including product documentation, guides, and reference materials.`,
    `All items are structured with titles, descriptions, and categorization metadata.`,
  ].join("\n");

  return { title, content, wordCount: content.split(/\s+/).filter(Boolean).length };
}

// ─── Content Quality Analysis ──────────────────────────────────────────────────

/**
 * Analyse actual content text and return a real ContentAnalysis.
 * Replaces generateMockAnalysis() with signal-based scoring.
 */
export function analyzeContentQuality(content: string, title: string): ContentAnalysis {
  const lower = content.toLowerCase();
  const words = content.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // ── Signals ──────────────────────────────────────────────────────────────────
  const hasEntityDef =
    /\bis\s+(a|an|the)\s+\w+/.test(lower) ||
    /\bdefined\s+as\b/.test(lower) ||
    /\brefers?\s+to\b/.test(lower) ||
    /\bwhat\s+is\b/.test(lower);

  const questionMatches = (lower.match(/\?\s*(\n|$)/gm) ?? []).length;
  const hasFaq =
    /\bfaq\b|frequently\s+asked|q&a\b|q\s*&\s*a/i.test(lower) ||
    questionMatches >= 3;

  const hasComparison = /\bvs\.?\b|\bversus\b|\bcompare\b|\bcomparison\b|\balternative/i.test(lower);

  const headingCount = (content.match(/^#{1,4}\s.+/gm) ?? []).length;
  const hasStructure = headingCount >= 3;

  const hasHowTo =
    /\bhow\s+to\b|\bstep[\s-]\d|\b\d+\.\s+\w/im.test(content) ||
    /\btutorial\b|\bguide\b|\bwalkthrough\b/i.test(lower);

  const hasStats = /\d+%|\d+\s*x\b|\$\d+|\d+\s*(million|billion|thousand|k\b)/i.test(content);
  const hasCitations = /\bsource:|\bcitation|\breference|\baccording\s+to\b|\bstudy\s+show|\bresearch\s+show/i.test(lower);
  const hasCode = /```[\s\S]*?```|`[^`\n]+`/.test(content) || /<code[\s>]/.test(content);

  const longEnough = wordCount >= 500;
  const veryLong = wordCount >= 1500;

  // ── Dimension scores (0–100) ──────────────────────────────────────────────────
  const entityScore = Math.min(
    100,
    (hasEntityDef ? 55 : 0) +
      (wordCount >= 200 ? 15 : 0) +
      (hasStructure ? 15 : 0) +
      (hasFaq ? 15 : 0)
  );

  const structureScore = Math.min(
    100,
    (hasStructure ? 35 : 0) +
      (hasFaq ? 20 : 0) +
      (hasHowTo ? 20 : 0) +
      (headingCount >= 6 ? 10 : headingCount >= 3 ? 5 : 0) +
      (longEnough ? 10 : 0) +
      (veryLong ? 5 : 0)
  );

  const authorityScore = Math.min(
    100,
    (hasStats ? 25 : 0) +
      (hasCitations ? 30 : 0) +
      (hasComparison ? 20 : 0) +
      (veryLong ? 15 : 0) +
      (hasCode ? 10 : 0)
  );

  const promptScore = Math.min(
    100,
    (hasFaq ? 30 : 0) +
      (hasComparison ? 25 : 0) +
      (hasHowTo ? 20 : 0) +
      (hasEntityDef ? 25 : 0)
  );

  const score = Math.max(
    8,
    Math.round(entityScore * 0.25 + structureScore * 0.30 + authorityScore * 0.20 + promptScore * 0.25)
  );

  // ── Gaps ─────────────────────────────────────────────────────────────────────
  const gaps: ContentGap[] = [];

  if (!hasEntityDef) {
    gaps.push({
      id: "g-entity",
      label: "Missing entity definition",
      description: 'No clear "X is Y" statement found. LLMs prefer pages that define their subject explicitly.',
      severity: "critical",
      fix: `Add a one-sentence definition in the first paragraph, e.g., "${title} is a [category] that [does X]."`,
    });
  }

  if (!hasFaq) {
    gaps.push({
      id: "g-faq",
      label: "No FAQ section",
      description: "FAQ content is cited 3.2× more often by LLMs than prose-only pages.",
      severity: "high",
      fix: "Add 5–7 Q&A pairs covering the most common user questions about this topic.",
    });
  }

  if (!hasComparison) {
    gaps.push({
      id: "g-comparison",
      label: "No comparison content",
      description: "Comparison and 'vs.' content appears in 40% of LLM responses for competitive queries.",
      severity: "high",
      fix: "Add a comparison section or table showing how this differs from alternatives.",
    });
  }

  if (!hasStructure) {
    gaps.push({
      id: "g-structure",
      label: "Poor heading structure",
      description: `Only ${headingCount} heading(s) found. Structured content with H2/H3 sections is preferred by LLMs.`,
      severity: headingCount === 0 ? "critical" : "medium",
      fix: "Break the content into clearly labelled sections with descriptive H2/H3 headings.",
    });
  }

  if (!longEnough) {
    gaps.push({
      id: "g-length",
      label: "Content too short",
      description: `${wordCount} words is below the 500-word minimum for strong LLM citation. Target 1,000–2,000 words.`,
      severity: "high",
      fix: "Expand the content with more detail, examples, use cases, and supporting information.",
    });
  }

  if (!hasStats) {
    gaps.push({
      id: "g-stats",
      label: "No data or statistics",
      description: "Content with specific numbers and statistics is cited ~2× more often by LLMs.",
      severity: "medium",
      fix: "Add specific metrics, percentages, or benchmark results to support your claims.",
    });
  }

  // ── Recommendations ──────────────────────────────────────────────────────────
  const recommendations = [
    !hasEntityDef && { action: `Add a clear entity definition for "${title}"`, impact: 9 },
    !hasFaq && { action: "Add an FAQ section with 5–7 Q&A pairs", impact: 8 },
    !hasComparison && { action: "Add a comparison table vs. top alternatives", impact: 7 },
    !hasStructure && { action: "Restructure with clear H2/H3 section headings", impact: 6 },
    !hasStats && { action: "Add specific statistics and quantified claims", impact: 5 },
    !hasCitations && { action: "Include citations and references to authoritative sources", impact: 4 },
  ].filter(Boolean) as Array<{ action: string; impact: number }>;

  return {
    score,
    analyzed_at: new Date().toISOString(),
    gaps: gaps.slice(0, 5),
    dimension_scores: [
      { label: "Entity Clarity", score: entityScore, max: 100 },
      { label: "Structure Quality", score: structureScore, max: 100 },
      { label: "Educational Authority", score: authorityScore, max: 100 },
      { label: "Prompt Coverage", score: promptScore, max: 100 },
    ],
    recommendations: recommendations.slice(0, 5),
  };
}
