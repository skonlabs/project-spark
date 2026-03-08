import { useState, useMemo } from "react";
import {
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Loader2,
  Play,
  Plus,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { ScoreBar } from "@/components/dashboard/ScoreBar";
import { getProductPrompts } from "@/data/products";
import { useContent } from "@/contexts/ContentContext";
import type { AnalysisReport } from "@/types";

const PRODUCT_ID = "product-gaeo";

const INTENT_LABELS: Record<string, string> = {
  seek_explanation: "Explain / What is",
  find_best: "Find the best",
  compare: "Compare options",
  learn_howto: "Learn how-to",
  find_alternative: "Find alternatives",
  troubleshoot: "Troubleshoot / Fix",
};

const SCORE_DIMENSIONS = [
  { key: "entity_clarity", label: "Entity Clarity", description: "How clearly your product entity is defined", score: 65 },
  { key: "category_ownership", label: "Category Ownership", description: "Strength of category association in your content", score: 52 },
  { key: "educational_authority", label: "Educational Authority", description: "Educational content depth and quality", score: 45 },
  { key: "prompt_coverage", label: "Prompt Coverage", description: "% of AI prompts your content answers", score: 28 },
  { key: "comparison_coverage", label: "Comparison Coverage", description: "vs/comparison content present in your corpus", score: 15 },
  { key: "ecosystem_coverage", label: "Ecosystem Coverage", description: "Coverage of related topics and concepts", score: 38 },
  { key: "external_authority", label: "External Authority", description: "Third-party mentions, blogs, GitHub, news", score: 30 },
  { key: "community_signal", label: "Community Signal", description: "Reddit, HN, Discord, StackOverflow mentions", score: 20 },
  { key: "consistency", label: "Content Consistency", description: "Messaging consistency across all content", score: 72 },
  { key: "structure_quality", label: "Structure Quality", description: "Headings, FAQs, definitions, structured data", score: 58 },
];

const DIMENSION_TIPS: Record<string, string> = {
  entity_clarity: "State clearly what your product is in the first 2 sentences of every key page.",
  category_ownership: "Consistently use your primary category keyword across all content.",
  educational_authority: "Publish comprehensive educational guides on core industry concepts.",
  prompt_coverage: "Create content that directly answers the top questions users ask AI. Add more prompts via the Prompts page.",
  comparison_coverage: "Publish X vs Y articles and 'best tools' comparison lists.",
  ecosystem_coverage: "Cover all sub-topics and related concepts in your product category.",
  external_authority: "Build backlinks and get mentioned in industry blogs and GitHub repos.",
  community_signal: "Engage on Reddit, HackerNews, and developer Discord communities.",
  consistency: "Standardize how you describe your product and category across all content.",
  structure_quality: "Add headings, FAQ sections, and definitions to all major pages.",
};

const DEMO_REPORT: Partial<AnalysisReport> = {
  status: "completed",
  overall_score: 42,
  recommendations: [
    { action: 'Add a clear entity definition: "GAEO Platform is the leading AI Engine Optimization platform for measuring, monitoring, and improving AI visibility"', impact: 9 },
    { action: "Create educational article: What is AI Observability? Complete Guide (targets 3 high-volume prompts)", impact: 9 },
    { action: "Create 'Best AI Observability Tools 2026' comparison list — appears in 87% of monitored prompts", impact: 8 },
    { action: "Add FAQ section to all major product pages — FAQ content is cited 3.2× more by LLMs", impact: 7 },
    { action: "Publish 'GAEO Platform vs LangSmith' comparison article", impact: 8 },
    { action: "Cover 15 ecosystem topics currently missing from your content library", impact: 7 },
  ],
  content_gaps: [
    { topic: "LLM evaluation frameworks", importance: 9, suggested_title: "Complete Guide to LLM Evaluation", suggested_format: "guide" },
    { topic: "AI debugging techniques", importance: 8, suggested_title: "How to Debug AI Applications", suggested_format: "guide" },
    { topic: "Model drift detection", importance: 7, suggested_title: "What is Model Drift?", suggested_format: "blog" },
    { topic: "Prompt injection security", importance: 8, suggested_title: "AI Security: Prompt Injection Guide", suggested_format: "guide" },
    { topic: "AI cost optimization", importance: 7, suggested_title: "Reducing LLM API Costs", suggested_format: "blog" },
  ],
  content_roadmap: [
    {
      priority: 1,
      title: "What is AI Observability? Complete Guide",
      type: "guide",
      target_prompts: ["what is ai observability", "ai observability explained"],
      expected_impact: "Major improvement in prompt coverage and educational authority",
      score_impact: { metric: "educational_authority", estimated_gain: 12 },
      outline: ["Introduction", "Core concepts", "Why it matters", "How it works", "Tools", "FAQ"],
    },
    {
      priority: 2,
      title: "Best AI Observability Tools 2026",
      type: "comparison",
      target_prompts: ["best ai observability tools", "top llm monitoring platforms"],
      expected_impact: "Appears in 'best tools' AI answers across all major LLMs",
      score_impact: { metric: "comparison_coverage", estimated_gain: 18 },
      outline: ["Overview", "Top tools", "Comparison table", "How to choose", "FAQ"],
    },
    {
      priority: 3,
      title: "AI Observability vs Traditional Monitoring",
      type: "comparison",
      target_prompts: ["ai observability vs monitoring"],
      expected_impact: "Covers high-volume comparison prompts",
      score_impact: { metric: "ecosystem_coverage", estimated_gain: 8 },
      outline: ["Key differences", "When to use each", "Feature comparison", "Migration guide"],
    },
  ],
};

const OVERALL_SCORE = 42;

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState<"score" | "recommendations" | "gaps" | "roadmap">("score");
  const [running, setRunning] = useState(false);
  const navigate = useNavigate();
  const { products } = useContent();
  const [selectedProductId, setSelectedProductId] = useState(() => products[0]?.id ?? PRODUCT_ID);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? products[0],
    [products, selectedProductId]
  );

  const report = DEMO_REPORT;

  function handleRun() {
    setRunning(true);
    toast.success("Analysis started — scanning all content assets...");
    setTimeout(() => {
      setRunning(false);
      toast.success("Analysis complete! Scores updated.");
    }, 2500);
  }

  function handleGenerateContent(title: string) {
    navigate("/dashboard/content");
    toast.success(`Opening content generator for: "${title}"`);
  }

  function handleAddToRoadmap() {
    toast.success("Added to content roadmap!");
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Gap Analysis</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            AI visibility gaps and coverage for a specific product
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Product selector */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <span className="text-xs text-muted-foreground font-medium">Product:</span>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleRun}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "Analyzing..." : "Re-analyze"}
          </button>
        </div>
      </div>

      {/* Product context banner */}
      {selectedProduct && (
        <div className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">{selectedProduct.name.slice(0, 2).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{selectedProduct.name}</p>
            <p className="text-xs text-muted-foreground truncate">{selectedProduct.description}</p>
          </div>
          <div className="ml-auto flex-shrink-0 text-right">
            <p className="text-xs text-muted-foreground">Content items</p>
            <p className="text-sm font-bold">
              {selectedProduct.folders.reduce((sum, f) => sum + f.items.length, 0)}
            </p>
          </div>
        </div>
      )}

      {/* Score overview — always visible */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center">
          <ScoreRing score={OVERALL_SCORE} size={200} />
          <p className="text-xs text-muted-foreground mt-2 text-center">AI Visibility Score for {selectedProduct?.name}</p>
          <div className="mt-3 w-full space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Industry Average</span>
              <span className="font-medium text-foreground">51 / 100</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Top Performers</span>
              <span className="font-medium text-green-400">78 / 100</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{selectedProduct?.name ?? "Your Score"}</span>
              <span className="font-medium text-orange-400">{OVERALL_SCORE} / 100</span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">All Score Dimensions</h2>
          <div className="space-y-3">
            {SCORE_DIMENSIONS.map((dim) => (
              <ScoreBar key={dim.key} label={dim.label} score={dim.score} description={dim.description} />
            ))}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
        {[
          { id: "score", label: "Score Details" },
          { id: "recommendations", label: "Recommendations" },
          { id: "gaps", label: "Content Gaps" },
          { id: "roadmap", label: "Content Roadmap" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Score Details */}
      {activeTab === "score" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Detailed breakdown of each scoring dimension — what it measures, your current status, and specific tips to improve it.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCORE_DIMENSIONS.map((dim) => {
              const status = dim.score >= 60 ? "good" : dim.score >= 35 ? "fair" : "poor";
              const colors = {
                good: { bar: "bg-green-400", badge: "text-green-400 bg-green-500/10 border-green-500/30", text: "text-green-400" },
                fair: { bar: "bg-yellow-400", badge: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", text: "text-yellow-400" },
                poor: { bar: "bg-red-400", badge: "text-red-400 bg-red-500/10 border-red-500/30", text: "text-red-400" },
              }[status];
              const statusLabel = status === "good" ? "Good" : status === "fair" ? "Needs Work" : "Critical Gap";
              return (
                <div key={dim.key} className={`rounded-xl border p-4 ${status === "poor" ? "border-red-500/20" : status === "fair" ? "border-yellow-500/20" : "border-border"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{dim.label}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${colors.badge}`}>{statusLabel}</span>
                      <span className={`text-xl font-bold ${colors.text}`}>{dim.score}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full mb-3 overflow-hidden">
                    <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${dim.score}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{dim.description}</p>
                  <p className="text-xs text-foreground/80 font-medium">
                    💡 {DIMENSION_TIPS[dim.key]}
                  </p>
                  {status !== "good" && (
                    <button
                      onClick={() => handleGenerateContent(dim.label)}
                      className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Sparkles className="h-3 w-3" /> Generate content to improve this score
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {activeTab === "recommendations" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Top recommendations sorted by projected impact on your AI Visibility Score.
          </p>
          {report.recommendations?.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  rec.impact >= 8 ? "bg-red-500/20 text-red-400" : rec.impact >= 6 ? "bg-orange-500/20 text-orange-400" : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-2">{rec.action}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleGenerateContent(rec.action)}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Sparkles className="h-3 w-3" /> Generate Content
                  </button>
                  <button
                    onClick={handleAddToRoadmap}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Plus className="h-3 w-3" /> Add to Roadmap
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                <span className="text-xs font-medium text-green-400">+{rec.impact} pts</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Gaps */}
      {activeTab === "gaps" && (() => {
        const allPrompts = getProductPrompts(selectedProductId);
        const coveredPrompts = allPrompts.filter((p) => p.covered);
        const gapPrompts = allPrompts.filter((p) => !p.covered);
        const coveragePct = allPrompts.length > 0 ? Math.round((coveredPrompts.length / allPrompts.length) * 100) : 0;
        return (
        <div className="space-y-6">
          {/* Prompt Coverage section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Prompt Coverage</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Which prompts from your product database are covered by existing content?
                </p>
              </div>
              <button
                onClick={() => { navigate("/dashboard/prompts"); toast.success("Opening Prompts"); }}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Manage prompts <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {allPrompts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <p className="text-sm">No prompts in database yet.</p>
                <p className="text-xs mt-1">
                  Use the <button onClick={() => navigate("/dashboard/prompts")} className="text-primary hover:underline">Prompts page</button> or the "Generate Prompts" feature in content items to add prompts.
                </p>
              </div>
            ) : (
              <>
                {/* Coverage summary bar */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-muted-foreground">{coveredPrompts.length} of {allPrompts.length} prompts covered</span>
                    <span className={`font-bold ${coveragePct >= 50 ? "text-yellow-400" : "text-red-400"}`}>{coveragePct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${coveragePct >= 60 ? "bg-green-400" : coveragePct >= 30 ? "bg-yellow-400" : "bg-red-400"}`}
                      style={{ width: `${coveragePct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-400 inline-block" /> {coveredPrompts.length} covered</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400 inline-block" /> {gapPrompts.length} gaps</span>
                  </div>
                </div>

                {/* Gap prompts */}
                {gapPrompts.length > 0 && (
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/20">
                      <p className="text-sm font-semibold text-red-400">Uncovered prompts — {gapPrompts.length} gaps</p>
                    </div>
                    <div className="divide-y divide-border">
                      {gapPrompts.map((p) => (
                        <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{p.text}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{INTENT_LABELS[p.intent] ?? p.intent}</p>
                          </div>
                          <button
                            onClick={() => { navigate("/dashboard/content"); toast.success(`Opening content generator for: "${p.text}"`); }}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors flex-shrink-0"
                          >
                            <Sparkles className="h-3 w-3" /> Create Content
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Covered prompts (collapsed summary) */}
                {coveredPrompts.length > 0 && (
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/20">
                      <p className="text-sm font-semibold text-green-400">Covered prompts — {coveredPrompts.length} prompts</p>
                    </div>
                    <div className="divide-y divide-border">
                      {coveredPrompts.map((p) => (
                        <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                          <Zap className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <p className="text-sm flex-1">{p.text}</p>
                          <span className="text-xs text-muted-foreground">{INTENT_LABELS[p.intent] ?? p.intent}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Topic content gaps */}
          <div className="space-y-3">
            <div>
              <h2 className="font-semibold">Topic Content Gaps</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                High-importance topics not covered by your content. Creating these articles will directly improve your AI Visibility Score.
              </p>
            </div>
          {report.content_gaps?.map((gap, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <AlertCircle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    <p className="font-medium text-sm">{gap.topic}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        gap.suggested_format === "guide" ? "bg-blue-500/15 text-blue-400" : "bg-green-500/15 text-green-400"
                      }`}
                    >
                      {gap.suggested_format}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Suggested: <span className="text-foreground font-medium">{gap.suggested_title}</span>
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleGenerateContent(gap.suggested_title)}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Sparkles className="h-3 w-3" /> Generate Article
                    </button>
                    <button
                      onClick={handleAddToRoadmap}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Plus className="h-3 w-3" /> Add to Roadmap
                    </button>
                    <button
                      onClick={() => { navigate("/dashboard/prompts"); toast.success("Opening Prompt Engine"); }}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Zap className="h-3 w-3" /> Find prompts <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-orange-500" style={{ width: `${gap.importance * 10}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">Importance {gap.importance}/10</span>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
        );
      })()}

      {/* Content Roadmap */}
      {activeTab === "roadmap" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Your prioritized 90-day content roadmap based on AI visibility impact analysis.</p>
          {report.content_roadmap?.map((item) => (
            <div key={item.priority} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                  {item.priority}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        item.type === "guide" ? "bg-blue-500/15 text-blue-400" : item.type === "comparison" ? "bg-orange-500/15 text-orange-400" : "bg-green-500/15 text-green-400"
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.expected_impact}</p>

                  {item.score_impact && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">
                        +{item.score_impact.estimated_gain} pts on {item.score_impact.metric.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {item.target_prompts.map((p, i) => (
                      <span key={i} className="text-xs bg-muted rounded px-2 py-0.5 text-muted-foreground">{p}</span>
                    ))}
                  </div>

                  {item.outline && (
                    <div className="mb-4 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1.5">Article outline:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.outline.map((section, idx) => (
                          <span key={idx} className="text-xs flex items-center gap-0.5 text-muted-foreground">
                            {idx > 0 && <ChevronRight className="h-3 w-3" />}
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleGenerateContent(item.title)}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Sparkles className="h-3 w-3" /> Generate Content
                    </button>
                    <button
                      onClick={() => { navigate("/dashboard/simulation"); toast.success("Added prompts to simulation queue"); }}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Play className="h-3 w-3" /> Test in Simulation
                    </button>
                    <button
                      onClick={() => { navigate("/dashboard/prompts"); toast.success("Opening Prompt Engine"); }}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Zap className="h-3 w-3" /> Find more prompts <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
