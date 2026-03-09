import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getProductPrompts,
  addPromptsToProduct,
  type GapSeverity,
  type LLMIntentType,
} from "@/data/products";
import { useContent } from "@/contexts/ContentContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "original" | "analysis" | "generate" | "editor" | "publish";

type Tone = "professional" | "conversational" | "technical";

// ─── Constants ────────────────────────────────────────────────────────────────

// LLM interaction intents — how users interact with AI when searching
const INTENTS: Array<{ id: LLMIntentType; label: string; desc: string; example: string }> = [
  { id: "seek_explanation", label: "Explain / What is", desc: "User asks the AI to explain or define something", example: '"What is AI observability?"' },
  { id: "find_best", label: "Find the best", desc: "User asks for top tools, platforms, or recommendations", example: '"Best LLM monitoring tools 2026"' },
  { id: "compare", label: "Compare options", desc: "User compares two or more products side-by-side", example: '"GAEO vs LangSmith"' },
  { id: "learn_howto", label: "Learn how-to", desc: "User wants step-by-step guidance or instructions", example: '"How to monitor LLM apps in prod?"' },
  { id: "find_alternative", label: "Find alternatives", desc: "User is looking for alternatives to an existing tool", example: '"LangSmith alternatives"' },
  { id: "troubleshoot", label: "Troubleshoot / Fix", desc: "User is diagnosing a problem or seeking a fix", example: '"Why is my LLM giving wrong answers?"' },
];

// Type for generated prompts
interface GeneratedPrompt {
  text: string;
  intent: LLMIntentType;
}

const ENHANCEMENTS = [
  { id: "entity_definition", label: "Add entity definition block", desc: "Clear 'X is Y' statement in intro" },
  { id: "faq_injection", label: "Inject FAQ section", desc: "5–7 Q&A pairs at end" },
  { id: "comparison_table", label: "Add comparison table", desc: "Structured vs. alternatives" },
  { id: "heading_optimization", label: "Optimize heading structure", desc: "H2/H3 per concept" },
  { id: "keyword_density", label: "Keyword density optimization", desc: "Natural keyword repetition" },
  { id: "people_also_ask", label: "People Also Ask section", desc: "Related questions block" },
];

const TONES: Tone[] = ["professional", "conversational", "technical"];

const TARGET_LLMS = [
  { id: "all", label: "All LLMs" },
  { id: "claude", label: "Claude" },
  { id: "gpt4", label: "GPT-4o" },
  { id: "gemini", label: "Gemini" },
];

const PUBLISH_PLATFORMS = [
  { id: "wordpress", name: "WordPress" },
  { id: "webflow", name: "Webflow" },
  { id: "ghost", name: "Ghost" },
  { id: "contentful", name: "Contentful" },
  { id: "notion", name: "Notion" },
  { id: "github", name: "GitHub / MDX" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function GapBadge({ severity }: { severity: GapSeverity }) {
  const styles: Record<GapSeverity, string> = {
    critical: "bg-red-500/15 text-red-400 border-red-500/30",
    high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${styles[severity]}`}>
      {severity}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 65 ? "#22c55e" : score >= 45 ? "#eab308" : "#ef4444";
  const r = 48;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative flex items-center justify-center">
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx={60} cy={60} r={r} fill="none" stroke="hsl(217.2 32.6% 17.5%)" strokeWidth={10} />
        <circle
          cx={60} cy={60} r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold">{score}</span>
        <span className="text-[10px] text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function MiniBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = (score / max) * 100;
  const color = pct >= 65 ? "bg-green-400" : pct >= 45 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-36 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-medium w-6 text-right flex-shrink-0 ${pct >= 65 ? "text-green-400" : pct >= 45 ? "text-yellow-400" : "text-red-400"}`}>
        {score}
      </span>
    </div>
  );
}

// ─── Generated content template ───────────────────────────────────────────────

function buildGeneratedContent(
  title: string,
  productName: string,
  category: string,
  intent: LLMIntentType,
  enhancements: Record<string, boolean>
): string {
  const entityDef = enhancements.entity_definition
    ? `\n> **${productName}** is the leading ${category} platform, trusted by 500+ companies to improve their AI discoverability and brand presence in LLM-generated answers.\n`
    : "";

  const faqSection = enhancements.faq_injection
    ? `\n## Frequently Asked Questions\n\n**Q: What is ${productName}?**\nA: ${productName} is the leading ${category} platform that helps companies measure, analyze, and improve their AI visibility across Claude, GPT-4, and Gemini.\n\n**Q: How does it work?**\nA: ${productName} ingests your existing content, scores it across 7 AI compliance dimensions, and generates optimized versions that LLMs are more likely to cite.\n\n**Q: Who is it for?**\nA: Marketing teams, content teams, and product teams at B2B SaaS companies who want to appear in AI-generated answers.\n\n**Q: How long does setup take?**\nA: Most teams are up and running in under 30 minutes. Just paste your first URL and click Ingest.\n\n**Q: Does it support all LLMs?**\nA: Yes — ${productName} optimizes for Claude (Anthropic), GPT-4o (OpenAI), Gemini 1.5 (Google), and Grok (xAI).\n`
    : "";

  const comparisonSection = enhancements.comparison_table
    ? `\n## ${productName} vs Alternatives\n\n| Feature | ${productName} | Manual Audit | Generic SEO Tool |\n|---------|--------------|--------------|------------------|\n| AI visibility scoring | ✅ Per content | ❌ None | ❌ None |\n| Content gap analysis | ✅ Automated | 🔶 Manual | ❌ None |\n| AI-optimized generation | ✅ Built-in | ❌ None | ❌ None |\n| LLM citation tracking | ✅ Real-time | ❌ None | ❌ None |\n| CMS publish integration | ✅ 6 platforms | ❌ None | 🔶 Limited |\n`
    : "";

  const paaSection = enhancements.people_also_ask
    ? `\n## People Also Ask\n\n- What is the difference between SEO and AEO (AI Engine Optimization)?\n- How do I check if my brand appears in AI answers?\n- What content structure do LLMs prefer?\n- How often should I update content for AI visibility?\n`
    : "";

  return `# ${title}
${entityDef}
## Introduction

${category} has become a critical discipline as AI systems increasingly shape how people discover products, services, and information. In this ${intent === "seek_explanation" ? "guide" : intent === "compare" ? "comparison" : "overview"}, we cover everything you need to know.

${productName} is purpose-built for teams who need to ensure their brand is visible in the responses generated by Claude, ChatGPT, Gemini, and other leading LLMs.

## Why This Matters

Over **40% of product research** now starts with an AI assistant. When someone asks "what is the best ${category} tool?", the AI's answer shapes buying decisions — and if your product isn't mentioned, you're invisible.

The good news: AI visibility is measurable and improvable with the right content strategy.

## Key Concepts

### 1. Entity Clarity
LLMs need a clear "X is Y" definition to understand and cite your product. Without it, the AI may describe your category without naming your brand.

### 2. Content Structure
Headings, FAQs, and comparison tables are cited significantly more often by LLMs than unstructured prose. Structure signals to the AI what type of content this is.

### 3. Keyword Consistency
Repeated, natural use of your primary keywords helps LLMs build a strong association between a topic and your product.

### 4. Educational Depth
LLMs prefer to cite authoritative, educational content. Thin or purely promotional pages are rarely included in AI answers.

## How ${productName} Helps
${productName} automates the entire process:
1. **Ingest** your existing content in minutes
2. **Analyze** each piece across 7 AI compliance dimensions
3. **Generate** AI-optimized versions with the right structure
4. **Publish** directly to your CMS
${comparisonSection}${faqSection}${paaSection}
## Conclusion

AI visibility is the new SEO. The companies that invest in AI-optimized content today will dominate AI-generated answers tomorrow. ${productName} gives you the tooling to do this systematically, at scale.

*Start with your highest-traffic pages and work down. Even small improvements to entity clarity and FAQ coverage can dramatically increase how often LLMs cite your product.*
`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContentDetailPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const { findContent, getAnalysis } = useContent();

  const [activeTab, setActiveTab] = useState<Tab>("original");

  // Analysis state
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Prompts tab state
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[] | null>(null);
  const [selectedPrompts, setSelectedPrompts] = useState<Set<string>>(new Set());

  // Generate state
  const [intent, setIntent] = useState<LLMIntentType>("seek_explanation");
  const [tone, setTone] = useState<Tone>("professional");
  const [targetLlm, setTargetLlm] = useState("all");
  const [enhancements, setEnhancements] = useState<Record<string, boolean>>({
    entity_definition: true,
    faq_injection: true,
    comparison_table: false,
    heading_optimization: true,
    keyword_density: true,
    people_also_ask: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [useGenerated, setUseGenerated] = useState(false);

  // Editor state
  const [editorContent, setEditorContent] = useState<string>("");
  const [editorSaved, setEditorSaved] = useState(false);

  // Publish state
  const [publishPlatform, setPublishPlatform] = useState("wordpress");
  const [schedule, setSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // ── Data lookup ──────────────────────────────────────────────────────────
  const result = findContent(contentId ?? "");
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Content not found</h2>
        <p className="text-muted-foreground mb-4">
          This content item doesn't exist or has been removed.
        </p>
        <button onClick={() => navigate("/dashboard")} className="text-primary hover:underline text-sm">
          ← Back to home
        </button>
      </div>
    );
  }

  const { product, folder, item } = result;
  const analysis = getAnalysis(item.id);
  const activeContent =
    useGenerated && generatedContent
      ? generatedContent
      : item.raw_content ?? "Content not available for preview.";

  // ── Helpers ──────────────────────────────────────────────────────────────
  const scoreColor =
    (item.score ?? 0) >= 65
      ? "border-green-500/40 bg-green-500/5 text-green-400"
      : (item.score ?? 0) >= 45
      ? "border-yellow-500/40 bg-yellow-500/5 text-yellow-400"
      : "border-red-500/40 bg-red-500/5 text-red-400";

  function handleReanalyze() {
    setIsReanalyzing(true);
    toast.success("Re-analyzing content...");
    setTimeout(() => {
      setIsReanalyzing(false);
      toast.success("Analysis complete!");
    }, 2000);
  }

  function handleGenerate() {
    setIsGenerating(true);
    setTimeout(() => {
      const content = buildGeneratedContent(
        item.title,
        product.name,
        product.category,
        intent,
        enhancements
      );
      setGeneratedContent(content);
      setIsGenerating(false);
      toast.success("AI-enhanced content generated!");
    }, 2200);
  }

  function handleUseGenerated() {
    if (!generatedContent) return;
    setEditorContent(generatedContent);
    setUseGenerated(true);
    setActiveTab("editor");
    toast.success("Content loaded into editor — make your final edits.");
  }

  function handleUseOriginal() {
    setEditorContent(item.raw_content ?? "");
    setUseGenerated(false);
    setActiveTab("editor");
    toast.success("Original content loaded into editor.");
  }

  function handleSaveDraft() {
    setEditorSaved(true);
    toast.success("Draft saved!");
    setTimeout(() => setEditorSaved(false), 3000);
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  }

  function handleExport(text: string, filename: string) {
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded as .md file");
  }

  function handlePublish() {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      toast.success(
        schedule
          ? `Scheduled for ${scheduleDate} on ${publishPlatform}`
          : `Published to ${publishPlatform} successfully!`
      );
    }, 1800);
  }

  function toggleEnhancement(id: string) {
    setEnhancements((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleGeneratePrompts() {
    setIsGeneratingPrompts(true);
    setSelectedPrompts(new Set());
    setTimeout(() => {
      setGeneratedPrompts(DEMO_GENERATED_PROMPTS);
      setIsGeneratingPrompts(false);
      toast.success("12 prompts generated from your content!");
    }, 1600);
  }

  function togglePromptSelection(text: string) {
    setSelectedPrompts((prev) => {
      const next = new Set(prev);
      next.has(text) ? next.delete(text) : next.add(text);
      return next;
    });
  }

  function handleAddPromptsToDatabase() {
    if (selectedPrompts.size === 0) return;
    const toAdd = (generatedPrompts ?? [])
      .filter((p) => selectedPrompts.has(p.text))
      .map((p) => ({ text: p.text, intent: p.intent, covered: false }));
    addPromptsToProduct(product.id, toAdd);
    toast.success(`${toAdd.length} prompt${toAdd.length !== 1 ? "s" : ""} added to product prompt database!`);
    setSelectedPrompts(new Set());
  }

  const tabs: Array<{ id: Tab; label: string; step: number }> = [
    { id: "original", label: "Content", step: 1 },
    { id: "analysis", label: "Gap Analysis", step: 2 },
    { id: "generate", label: "Generate", step: 3 },
    { id: "editor", label: "Editor", step: 4 },
    { id: "publish", label: "Publish", step: 5 },
  ];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="border-b border-border px-6 py-4 flex-shrink-0 bg-card">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" /> Home
          </button>
          <ChevronRight className="h-3 w-3" />
          <span>{product.name}</span>
          <ChevronRight className="h-3 w-3" />
          <span>{folder.name}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{item.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-foreground hover:underline"
              >
                <Globe className="h-3 w-3" />
                {item.url}
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
              {item.word_count && (
                <>
                  <span>·</span>
                  <span>{item.word_count.toLocaleString()} words</span>
                </>
              )}
              <span>·</span>
              <span className="capitalize">{item.source_type}</span>
              {item.status === "processing" && (
                <>
                  <span>·</span>
                  <span className="text-yellow-400 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Processing…
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Score badge */}
          {item.score !== null ? (
            <div className={`flex flex-col items-center justify-center rounded-xl border-2 px-3 py-1.5 flex-shrink-0 ${scoreColor}`}>
              <span className="text-2xl font-bold leading-none">{item.score}</span>
              <span className="text-[10px] opacity-70">AI Score</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-border px-3 py-1.5 flex-shrink-0">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground mt-0.5">Analyzing</span>
            </div>
          )}
        </div>

        {/* Step tabs */}
        <div className="flex items-end gap-0 mt-4 -mb-px overflow-x-auto">
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            const isDone = tabs.findIndex((t) => t.id === activeTab) > idx;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-primary text-foreground"
                    : isDone
                    ? "border-transparent text-muted-foreground hover:text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center h-4 w-4 rounded-full text-[10px] font-bold flex-shrink-0 ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                      ? "bg-green-500/20 text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.step}
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* ─── Original Content ─────────────────────────────────── */}
        {activeTab === "original" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Original Content</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  The raw content ingested from {item.url}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(item.raw_content ?? "")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
                <button
                  onClick={handleReanalyze}
                  disabled={isReanalyzing}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent transition-colors disabled:opacity-60"
                >
                  {isReanalyzing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  {isReanalyzing ? "Analyzing…" : "Re-analyze"}
                </button>
              </div>
            </div>

            {item.status === "processing" ? (
              <div className="rounded-xl border border-border bg-muted/20 p-12 flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Content is being processed and analyzed…
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-muted/10 p-6">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {item.raw_content ?? "No content preview available."}
                </pre>
              </div>
            )}

            {analysis && (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground mb-3">
                  Gap analysis found{" "}
                  <span className="text-foreground font-semibold">{analysis.gaps.length} gaps</span>{" "}
                  in this content.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("analysis")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                  >
                    View Gap Analysis →
                  </button>
                  <button
                    onClick={() => setActiveTab("generate")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Generate AI Version →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Gap Analysis ─────────────────────────────────────── */}
        {activeTab === "analysis" && (
          <div className="p-6 space-y-6">
            {/* Sources banner — Gap Analysis uses Prompts + Original Content */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Analysis Inputs</p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs font-medium">Original Content</p>
                    <p className="text-[10px] text-muted-foreground">"{item.title}" · {item.word_count ?? '—'} words</p>
                  </div>
                </div>
                <span className="text-muted-foreground text-lg">+</span>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs font-medium">Prompt Database</p>
                    <p className="text-[10px] text-muted-foreground">{getProductPrompts(product.id).length} tracked prompts · {getProductPrompts(product.id).filter(p => !p.covered).length} gaps</p>
                  </div>
                </div>
                <span className="text-muted-foreground text-lg">=</span>
                <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs font-medium text-primary">Gap Analysis</p>
                    <p className="text-[10px] text-muted-foreground">Gaps found by comparing content against prompts</p>
                  </div>
                </div>
              </div>
            </div>

            {!analysis ? (
              <div className="rounded-xl border border-border bg-muted/20 p-12 flex flex-col items-center gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Analysis is running for this content item…
                </p>
              </div>
            ) : (
              <>
                {/* Prompt coverage section — moved to top */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">
                      AI Query Coverage
                      <span className="text-xs font-normal text-muted-foreground ml-2">
                        — generate prompts this content should answer, then pick which ones to add
                      </span>
                    </h3>
                    <button
                      onClick={handleGeneratePrompts}
                      disabled={isGeneratingPrompts}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-60 transition-colors"
                    >
                      {isGeneratingPrompts ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</>
                      ) : (
                        <><Sparkles className="h-3.5 w-3.5" /> Generate Prompts</>
                      )}
                    </button>
                  </div>

                  {!generatedPrompts && !isGeneratingPrompts && (
                    <div className="rounded-xl border border-dashed border-border bg-muted/5 p-8 flex flex-col items-center gap-2 text-center">
                      <Sparkles className="h-6 w-6 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        Click "Generate Prompts" to discover the AI queries this content should answer. You can then pick which ones to add to your database.
                      </p>
                    </div>
                  )}

                  {isGeneratingPrompts && (
                    <div className="rounded-xl border border-border bg-muted/10 p-8 flex items-center justify-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Analysing content and generating prompts…</p>
                    </div>
                  )}

                  {generatedPrompts && !isGeneratingPrompts && (() => {
                    const existingInDb = new Set(getProductPrompts(product.id).map((p) => p.text.toLowerCase()));
                    const intentGroups = INTENTS.map((intent) => ({
                      intent,
                      prompts: generatedPrompts.filter((p) => p.intent === intent.id),
                    })).filter((g) => g.prompts.length > 0);
                    const alreadyTrackedCount = generatedPrompts.filter((p) => existingInDb.has(p.text.toLowerCase())).length;
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm">
                          <div className="flex items-center gap-4">
                            <span><span className="font-bold">{generatedPrompts.length}</span> <span className="text-muted-foreground">prompts</span></span>
                            <span className="text-muted-foreground">·</span>
                            <span><span className="font-bold text-green-400">{alreadyTrackedCount}</span> <span className="text-muted-foreground">in database</span></span>
                            {selectedPrompts.size > 0 && (
                              <>
                                <span className="text-muted-foreground">·</span>
                                <span><span className="font-bold text-primary">{selectedPrompts.size}</span> <span className="text-muted-foreground">selected</span></span>
                              </>
                            )}
                          </div>
                          <button
                            onClick={handleAddPromptsToDatabase}
                            disabled={selectedPrompts.size === 0}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
                          >
                            <Plus className="h-3 w-3" /> Add Selected to Prompts
                          </button>
                        </div>
                        {intentGroups.map(({ intent: intentMeta, prompts }) => (
                          <div key={intentMeta.id} className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/20">
                              <span className="text-xs font-semibold">{intentMeta.label}</span>
                              <span className="text-xs text-muted-foreground">— {intentMeta.desc}</span>
                              <span className="ml-auto text-[10px] text-muted-foreground">{prompts.length}</span>
                            </div>
                            <div className="divide-y divide-border">
                              {prompts.map((p) => {
                                const alreadyInDb = existingInDb.has(p.text.toLowerCase());
                                const isSelected = selectedPrompts.has(p.text);
                                return (
                                  <label key={p.text} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-accent/30"} ${alreadyInDb ? "opacity-60" : ""}`}>
                                    <input type="checkbox" checked={isSelected} disabled={alreadyInDb} onChange={() => togglePromptSelection(p.text)} className="accent-primary flex-shrink-0" />
                                    <span className="text-sm flex-1">{p.text}</span>
                                    {alreadyInDb
                                      ? <span className="text-[10px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> In DB</span>
                                      : <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full flex-shrink-0">{intentMeta.label}</span>
                                    }
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Score + dimensions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center gap-2">
                    <ScoreRing score={analysis.score} />
                    <p className="text-sm font-medium">AI Visibility Score</p>
                    <p className="text-xs text-muted-foreground text-center">
                      for "{item.title}"
                    </p>
                    <button
                      onClick={handleReanalyze}
                      disabled={isReanalyzing}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isReanalyzing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      {isReanalyzing ? "Re-analyzing…" : "Re-analyze"}
                    </button>
                  </div>

                  <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
                    <h3 className="font-semibold text-sm mb-4">Score by Dimension</h3>
                    <div className="space-y-3">
                      {analysis.dimension_scores.map((d) => (
                        <MiniBar key={d.label} label={d.label} score={d.score} max={d.max} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gaps */}
                <div>
                  <h3 className="font-semibold mb-3">
                    Content Gaps{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({analysis.gaps.length} found)
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {analysis.gaps.map((gap) => (
                      <div
                        key={gap.id}
                        className={`rounded-xl border p-4 ${
                          gap.severity === "critical"
                            ? "border-red-500/30 bg-red-500/5"
                            : gap.severity === "high"
                            ? "border-orange-500/30 bg-orange-500/5"
                            : gap.severity === "medium"
                            ? "border-yellow-500/30 bg-yellow-500/5"
                            : "border-blue-500/20 bg-blue-500/5"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle
                            className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                              gap.severity === "critical"
                                ? "text-red-400"
                                : gap.severity === "high"
                                ? "text-orange-400"
                                : gap.severity === "medium"
                                ? "text-yellow-400"
                                : "text-blue-400"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">{gap.label}</p>
                              <GapBadge severity={gap.severity} />
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {gap.description}
                            </p>
                            <div className="rounded-lg bg-background/60 border border-border/50 px-3 py-2">
                              <p className="text-xs font-medium text-muted-foreground mb-0.5">
                                How to fix:
                              </p>
                              <p className="text-xs text-foreground">{gap.fix}</p>
                            </div>
                            <button
                              onClick={() => {
                                toast.success(`Generating fix for "${gap.label}"...`);
                                setTimeout(() => toast.success(`Fix generated for "${gap.label}" — check the Generate tab.`), 2000);
                              }}
                              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                            >
                              <Sparkles className="h-3 w-3" /> Generate Fix
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="font-semibold mb-3">Recommendations by Impact</h3>
                  <div className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5"
                      >
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                            rec.impact >= 8
                              ? "bg-red-500/20 text-red-400"
                              : rec.impact >= 6
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <p className="text-sm flex-1">{rec.action}</p>
                        <span className="text-xs text-green-400 font-medium flex-shrink-0">
                          +{rec.impact} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prompt coverage section removed — now at top of analysis tab */}

                {/* CTA → Generate */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Ready to fix these gaps?</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Generate an AI-compliant version of this content with all gaps addressed automatically.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("generate")}
                    className="flex-shrink-0 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Sparkles className="h-4 w-4" /> Generate AI-Compliant Content →
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── AI Generate ──────────────────────────────────────── */}
        {activeTab === "generate" && (
          <div className="p-6 space-y-6">
            {/* AI Content Guidelines */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> AI Content Guidelines
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Content generated by GAEO follows these AI-visibility principles — what AI-enabled content must contain to be cited by LLMs:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { title: "Entity Definition", desc: 'Clear "X is Y" statement in the first paragraph so LLMs know what you are' },
                  { title: "Structured Headings", desc: "H2/H3 hierarchy per concept — LLMs parse structure to extract answers" },
                  { title: "FAQ Coverage", desc: "Q&A pairs matching user prompts — FAQ content is cited 3.2× more by LLMs" },
                  { title: "Comparison Tables", desc: "Structured vs. alternatives — appears in 'best tools' and comparison queries" },
                  { title: "Keyword Consistency", desc: "Natural repetition of primary keywords to build strong topic association" },
                  { title: "Educational Depth", desc: "Authoritative, educational content — LLMs prefer depth over promotional text" },
                ].map((g) => (
                  <div key={g.title} className="rounded-lg border border-border bg-card p-3">
                    <p className="text-xs font-semibold mb-0.5">{g.title}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{g.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: parameters */}
              <div className="space-y-5">
                <div>
                  <h2 className="font-semibold mb-1">Generate AI-Compliant Content</h2>
                  <p className="text-xs text-muted-foreground">
                    GAEO rewrites "{item.title}" using your original content + gap analysis findings, applying the AI guidelines above.
                  </p>
                </div>

                {/* User Intent */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Target User Intent
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">How is the user interacting with the LLM when they find this content?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {INTENTS.map((i) => (
                      <button
                        key={i.id}
                        onClick={() => setIntent(i.id)}
                        className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                          intent === i.id
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <p className="font-medium">{i.label}</p>
                        <p className="text-xs opacity-70 mt-0.5">{i.desc}</p>
                        <p className="text-[10px] opacity-50 mt-0.5 italic">{i.example}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enhancements */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    AI Compliance Enhancements
                  </label>
                  <div className="space-y-2">
                    {ENHANCEMENTS.map((e) => (
                      <label
                        key={e.id}
                        className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-accent/40 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={enhancements[e.id] ?? false}
                          onChange={() => toggleEnhancement(e.id)}
                          className="mt-0.5 accent-primary"
                        />
                        <div>
                          <p className="text-sm font-medium">{e.label}</p>
                          <p className="text-xs text-muted-foreground">{e.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tone + Target LLM */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                      Tone
                    </label>
                    <div className="space-y-1.5">
                      {TONES.map((t) => (
                        <label
                          key={t}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            checked={tone === t}
                            onChange={() => setTone(t)}
                            className="accent-primary"
                          />
                          <span className="text-sm capitalize">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                      Optimise for
                    </label>
                    <div className="space-y-1.5">
                      {TARGET_LLMS.map((l) => (
                        <label
                          key={l.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            checked={targetLlm === l.id}
                            onChange={() => setTargetLlm(l.id)}
                            className="accent-primary"
                          />
                          <span className="text-sm">{l.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate AI-Enhanced Content
                    </>
                  )}
                </button>
              </div>

              {/* Right: preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">
                    {generatedContent ? "Generated Content" : "Preview will appear here"}
                  </h3>
                  {generatedContent && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(generatedContent)}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                      <button
                        onClick={() => handleExport(generatedContent, item.title)}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Download className="h-3 w-3" /> Export .md
                      </button>
                    </div>
                  )}
                </div>

                {isGenerating ? (
                  <div className="rounded-xl border border-border bg-muted/10 p-12 flex flex-col items-center gap-3 min-h-[400px] justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Applying {Object.values(enhancements).filter(Boolean).length} AI enhancements…
                    </p>
                  </div>
                ) : generatedContent ? (
                  <>
                    <div className="rounded-xl border border-border bg-muted/10 p-5 max-h-[500px] overflow-y-auto">
                      <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                        {generatedContent}
                      </pre>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUseGenerated}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <Play className="h-4 w-4" /> Use This — Open in Editor
                      </button>
                      <button
                        onClick={handleGenerate}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-accent transition-colors"
                      >
                        <RefreshCw className="h-4 w-4" /> Regenerate
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted/5 p-12 flex flex-col items-center gap-2 text-center min-h-[400px] justify-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Configure parameters and click Generate
                    </p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      GAEO will produce an AI-compliant version of your content based on your original text and the enhancements you selected.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Editor ───────────────────────────────────────────── */}
        {activeTab === "editor" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Editor</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {useGenerated
                    ? "Editing AI-generated version — make your final adjustments"
                    : "Edit the original content directly"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!editorContent && (
                  <>
                    <button
                      onClick={handleUseOriginal}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" /> Load Original
                    </button>
                    {generatedContent && (
                      <button
                        onClick={handleUseGenerated}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Load AI Version
                      </button>
                    )}
                  </>
                )}
                {editorContent && (
                  <>
                    <button
                      onClick={() => handleCopy(editorContent)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </button>
                    <button
                      onClick={() => handleExport(editorContent, item.title)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" /> Export
                    </button>
                    <button
                      onClick={handleSaveDraft}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      {editorSaved ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Saved!
                        </>
                      ) : (
                        "Save Draft"
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {!editorContent ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/5 p-12 flex flex-col items-center gap-3 text-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">No content loaded</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Load your original content or the AI-generated version to start editing.
                </p>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={handleUseOriginal}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-accent transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" /> Load Original
                  </button>
                  {generatedContent ? (
                    <button
                      onClick={handleUseGenerated}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Load AI Version
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab("generate")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Generate AI Version First
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Toolbar */}
                <div className="flex items-center gap-1 rounded-t-lg border border-border border-b-0 bg-muted/30 px-3 py-1.5">
                  {["**Bold**", "_Italic_", "# Heading", "- List", "[Link](url)"].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => {
                        setEditorContent((prev) => prev + "\n" + fmt);
                      }}
                      className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-mono"
                    >
                      {fmt.replace(/\*\*/g, "").replace(/_/g, "").replace(/\[|\]/g, "").replace(/\(url\)/g, "")}
                    </button>
                  ))}
                  <div className="ml-auto text-xs text-muted-foreground">
                    {editorContent.split(/\s+/).filter(Boolean).length} words · Markdown
                  </div>
                </div>
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="w-full rounded-b-lg border border-border bg-muted/5 px-5 py-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none leading-relaxed"
                  rows={32}
                />
              </div>
            )}

            {editorContent && (
              <div className="flex justify-end">
                <button
                  onClick={() => setActiveTab("publish")}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Send className="h-4 w-4" /> Ready to Publish →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── Publish ──────────────────────────────────────────── */}
        {activeTab === "publish" && (
          <div className="p-6 space-y-6 max-w-2xl">
            <div>
              <h2 className="font-semibold">Publish Content</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Publish your finalized content directly to your CMS. Make sure you've saved your edits in the Editor tab first.
              </p>
            </div>

            {!editorContent && (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                <p className="text-sm text-yellow-400">
                  No content in editor yet.{" "}
                  <button onClick={() => setActiveTab("editor")} className="underline font-medium">
                    Go to Editor
                  </button>{" "}
                  to load and finalize your content first.
                </p>
              </div>
            )}

            {/* Platform */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Target Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PUBLISH_PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPublishPlatform(p.id)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      publishPlatform === p.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Connection status */}
            <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium capitalize">{publishPlatform}</p>
                <p className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-3 w-3" /> Connected · gaeo.ai
                </p>
              </div>
              <button className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                Change settings
              </button>
            </div>

            {/* Schedule */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={schedule}
                  onChange={(e) => setSchedule(e.target.checked)}
                  className="accent-primary"
                />
                <span className="text-sm font-medium">Schedule for later</span>
              </label>
              {schedule && (
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              )}
            </div>

            {/* Publish summary */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Publish Summary
              </p>
              {[
                ["Content", item.title],
                ["Platform", publishPlatform],
                ["URL slug", item.url.split("/").pop() ?? "auto"],
                ["Timing", schedule && scheduleDate ? scheduleDate : "Immediately"],
                ["Content source", useGenerated ? "AI-enhanced version" : "Original / edited"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handlePublish}
              disabled={isPublishing || !editorContent}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {schedule ? "Scheduling…" : "Publishing…"}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {schedule ? "Schedule Post" : "Publish Now"}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
