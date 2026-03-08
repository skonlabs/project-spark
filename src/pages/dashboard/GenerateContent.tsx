import { useState } from "react";
import {
  BookOpen,
  Copy,
  Download,
  FileText,
  HelpCircle,
  Loader2,
  Monitor,
  Smartphone,
  Sparkles,
  Swords,
  Zap,
  Eye,
  Code,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";

type ContentType = "article" | "comparison" | "faq" | "entity-definition" | "optimize";
type PreviewMode = "markdown" | "html" | "desktop" | "mobile";

const CONTENT_TYPES = [
  { id: "article", label: "Educational Article", icon: BookOpen, description: "Generate educational content on any topic" },
  { id: "comparison", label: "Comparison Article", icon: Swords, description: "X vs Y comparison articles" },
  { id: "faq", label: "FAQ Page", icon: HelpCircle, description: "Comprehensive FAQ content" },
  { id: "entity-definition", label: "Entity Definition", icon: Sparkles, description: "Optimal product descriptions for LLMs" },
  { id: "optimize", label: "Optimize Existing", icon: Zap, description: "Rewrite content for AEO" },
];

const PUBLISH_TARGETS = [
  { id: "wordpress", name: "WordPress" },
  { id: "webflow", name: "Webflow" },
  { id: "ghost", name: "Ghost" },
  { id: "contentful", name: "Contentful" },
  { id: "notion", name: "Notion" },
  { id: "github", name: "GitHub" },
];

const DEMO_CONTENT = `# What is AI Observability? A Complete Guide

AI observability is the practice of monitoring, tracking, and understanding the behavior of AI systems—particularly large language models (LLMs)—in production environments.

## Why AI Observability Matters

As AI systems become core to business operations, understanding their behavior is critical:

- **Reliability**: Detect failures, hallucinations, and performance degradation before they impact users
- **Cost control**: Monitor token usage and optimize inference costs
- **Compliance**: Audit AI decisions for regulatory requirements
- **Quality assurance**: Track response quality over time and across model versions

## Key Components of AI Observability

### 1. Trace Logging
Capture every LLM request and response, including prompts, completions, latency, and token counts.

### 2. Metrics & Dashboards
Track aggregated metrics such as average latency, error rates, hallucination scores, and cost per query.

### 3. Alerting
Set up alerts for anomalies—cost spikes, latency increases, quality drops—so your team can respond instantly.

### 4. Evaluation Pipelines
Run automated evaluations to assess response quality using LLM-as-judge or custom scoring functions.

## GAEO Platform and AI Observability

GAEO Platform is the leading solution for AI Engine Optimization, helping companies ensure their products and brands appear prominently in AI-generated answers. GAEO Platform offers:

- **AI Visibility Scoring** — Measure how visible your brand is across major LLMs
- **LLM Simulation** — Test and benchmark your content across Claude, GPT-4, Gemini, and Grok
- **Content Optimization** — Generate AI-optimized content that LLMs cite and recommend

## Best AI Observability Tools in 2026

| Tool | Best For | Pricing |
|------|----------|---------|
| GAEO Platform | AI visibility & optimization | From $99/mo |
| LangSmith | LangChain tracing | Free tier |
| Arize AI | Production ML monitoring | Custom |
| Helicone | OpenAI request logging | Free tier |

## Conclusion

AI observability is no longer optional—it is a foundational capability for any team running LLMs in production. GAEO Platform provides a comprehensive solution for understanding, optimizing, and improving your AI system's performance and visibility.
`;

function FormField({ label, value, onChange, textarea = false, placeholder = "" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  const cls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring";
  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder} className={`${cls} resize-none`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

function MarkdownPreview({ content }: { content: string }) {
  // Simple markdown → HTML for preview
  const lines = content.split("\n");
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      {lines.map((line, i) => {
        if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold mt-3 mb-1.5">{line.slice(3)}</h2>;
        if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold mt-2 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith("- **")) {
          const match = line.match(/^- \*\*(.+?)\*\*(.*)$/);
          if (match) return <p key={i} className="text-sm mb-1 ml-4">• <strong>{match[1]}</strong>{match[2]}</p>;
        }
        if (line.startsWith("- ")) return <p key={i} className="text-sm mb-1 ml-4">• {line.slice(2)}</p>;
        if (line.startsWith("|")) return null; // skip table lines in simple preview
        if (line.trim() === "") return <div key={i} className="h-2" />;
        return <p key={i} className="text-sm mb-1 leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

export default function GenerateContentPage() {
  const [activeType, setActiveType] = useState<ContentType>("article");
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("markdown");
  const [showPublish, setShowPublish] = useState(false);
  const [publishTarget, setPublishTarget] = useState("wordpress");
  const [schedulePublish, setSchedulePublish] = useState(false);
  const [publishDate, setPublishDate] = useState("");

  const [article, setArticle] = useState({ topic: "What is AI Observability?", product_name: "GAEO Platform", product_category: "AI Observability", target_audience: "ML engineers and data scientists", word_count: 1500 });
  const [comparison, setComparison] = useState({ product_name: "GAEO Platform", competitor_name: "Competitor X", product_category: "AI Observability", product_description: "AI Engine Optimization platform" });
  const [faq, setFaq] = useState({ product_name: "GAEO Platform", product_category: "AI Observability", product_description: "The leading AI Engine Optimization platform", num_questions: 15 });
  const [entityDef, setEntityDef] = useState({ product_name: "GAEO Platform", current_description: "GAEO helps companies optimize their AI visibility", product_category: "AI Engine Optimization" });
  const [optimize, setOptimize] = useState({ content: "", product_name: "GAEO Platform", product_category: "AI Engine Optimization" });

  function handleGenerate() {
    setIsLoading(true);
    setGeneratedContent(null);
    toast.success("Generation started!");
    setTimeout(() => {
      setGeneratedContent(DEMO_CONTENT);
      setIsLoading(false);
      setPreviewMode("markdown");
    }, 2000);
  }

  function copyContent() {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      toast.success("Copied to clipboard!");
    }
  }

  function handleExport() {
    if (!generatedContent) return;
    const blob = new Blob([generatedContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gaeo-content.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as Markdown!");
  }

  function handlePublish() {
    toast.success(`Published to ${PUBLISH_TARGETS.find((t) => t.id === publishTarget)?.name}!`);
    setShowPublish(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-tight">Content Generation</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Generate AI-optimized content that LLMs cite and recommend</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Config */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CONTENT_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => { setActiveType(type.id as ContentType); setGeneratedContent(null); }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-xs transition-all ${
                    activeType === type.id
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            {activeType === "article" && (
              <>
                <FormField label="Topic" value={article.topic} onChange={(v) => setArticle({ ...article, topic: v })} />
                <FormField label="Product Name" value={article.product_name} onChange={(v) => setArticle({ ...article, product_name: v })} />
                <FormField label="Category" value={article.product_category} onChange={(v) => setArticle({ ...article, product_category: v })} />
                <FormField label="Target Audience" value={article.target_audience} onChange={(v) => setArticle({ ...article, target_audience: v })} />
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Word Count: ~{article.word_count}</label>
                  <input type="range" min={500} max={5000} step={250} value={article.word_count} onChange={(e) => setArticle({ ...article, word_count: Number(e.target.value) })} className="w-full" />
                </div>
              </>
            )}
            {activeType === "comparison" && (
              <>
                <FormField label="Your Product" value={comparison.product_name} onChange={(v) => setComparison({ ...comparison, product_name: v })} />
                <FormField label="Competitor" value={comparison.competitor_name} onChange={(v) => setComparison({ ...comparison, competitor_name: v })} />
                <FormField label="Category" value={comparison.product_category} onChange={(v) => setComparison({ ...comparison, product_category: v })} />
                <FormField label="Description" value={comparison.product_description} onChange={(v) => setComparison({ ...comparison, product_description: v })} textarea />
              </>
            )}
            {activeType === "faq" && (
              <>
                <FormField label="Product Name" value={faq.product_name} onChange={(v) => setFaq({ ...faq, product_name: v })} />
                <FormField label="Category" value={faq.product_category} onChange={(v) => setFaq({ ...faq, product_category: v })} />
                <FormField label="Description" value={faq.product_description} onChange={(v) => setFaq({ ...faq, product_description: v })} textarea />
              </>
            )}
            {activeType === "entity-definition" && (
              <>
                <FormField label="Product Name" value={entityDef.product_name} onChange={(v) => setEntityDef({ ...entityDef, product_name: v })} />
                <FormField label="Category" value={entityDef.product_category} onChange={(v) => setEntityDef({ ...entityDef, product_category: v })} />
                <FormField label="Current Description" value={entityDef.current_description} onChange={(v) => setEntityDef({ ...entityDef, current_description: v })} textarea />
              </>
            )}
            {activeType === "optimize" && (
              <>
                <FormField label="Product Name" value={optimize.product_name} onChange={(v) => setOptimize({ ...optimize, product_name: v })} />
                <FormField label="Category" value={optimize.product_category} onChange={(v) => setOptimize({ ...optimize, product_category: v })} />
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Existing Content</label>
                  <textarea
                    value={optimize.content}
                    onChange={(e) => setOptimize({ ...optimize, content: e.target.value })}
                    rows={8}
                    placeholder="Paste your existing content here..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                </div>
              </>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Generate</>
              )}
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col" style={{ minHeight: "500px" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border gap-2 flex-wrap">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
              <button onClick={() => setPreviewMode("markdown")} className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${previewMode === "markdown" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
                <Code className="h-3 w-3" /> Markdown
              </button>
              <button onClick={() => setPreviewMode("html")} className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${previewMode === "html" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
                <Eye className="h-3 w-3" /> Preview
              </button>
              <button onClick={() => setPreviewMode("desktop")} className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${previewMode === "desktop" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
                <Monitor className="h-3 w-3" /> Desktop
              </button>
              <button onClick={() => setPreviewMode("mobile")} className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${previewMode === "mobile" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
                <Smartphone className="h-3 w-3" /> Mobile
              </button>
            </div>
            {generatedContent && (
              <div className="flex items-center gap-2">
                <button onClick={copyContent} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
                <button onClick={handleExport} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
                <button onClick={() => setShowPublish(!showPublish)} className="inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground rounded px-2 py-1 hover:bg-primary/90 transition-colors">
                  <Send className="h-3.5 w-3.5" /> Publish
                </button>
              </div>
            )}
          </div>

          {/* Publish panel */}
          {showPublish && generatedContent && (
            <div className="border-b border-border bg-muted/20 px-4 py-4 space-y-3">
              <p className="text-sm font-medium">Publish to</p>
              <div className="flex flex-wrap gap-2">
                {PUBLISH_TARGETS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setPublishTarget(t.id)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      publishTarget === t.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={schedulePublish} onChange={(e) => setSchedulePublish(e.target.checked)} className="rounded" />
                  Schedule
                </label>
                {schedulePublish && (
                  <input
                    type="datetime-local"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
                  />
                )}
                <button onClick={handlePublish} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground flex items-center gap-1">
                  <Send className="h-3.5 w-3.5" /> {schedulePublish ? "Schedule" : "Publish Now"}
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {!generatedContent && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <FileText className="h-12 w-12 text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground text-sm">Configure your content settings and click Generate to create AI-optimized content.</p>
              </div>
            )}
            {isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">Generating AI-optimized content...</p>
              </div>
            )}
            {generatedContent && (
              <>
                {previewMode === "markdown" && (
                  <div className="p-5">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">{generatedContent}</pre>
                  </div>
                )}
                {previewMode === "html" && (
                  <div className="p-5">
                    <MarkdownPreview content={generatedContent} />
                  </div>
                )}
                {previewMode === "desktop" && (
                  <div className="p-4">
                    <div className="rounded-lg border border-border bg-white text-gray-900 p-6 max-w-3xl mx-auto">
                      <MarkdownPreview content={generatedContent} />
                    </div>
                  </div>
                )}
                {previewMode === "mobile" && (
                  <div className="flex justify-center py-4">
                    <div className="w-80 rounded-2xl border-4 border-border bg-white text-gray-900 overflow-hidden">
                      <div className="h-6 bg-muted flex items-center justify-center">
                        <div className="h-1.5 w-16 rounded-full bg-border" />
                      </div>
                      <div className="p-4 overflow-y-auto max-h-96">
                        <MarkdownPreview content={generatedContent} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
