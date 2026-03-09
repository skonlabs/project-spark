import { useState, useMemo } from "react";
import {
  AlertCircle, ArrowRight, BarChart2, CheckCircle2, ChevronRight,
  FileText, Loader2, MessageSquare, Play, Plus, Sparkles, TrendingUp, Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { ScoreBar } from "@/components/dashboard/ScoreBar";
import { CONTENT_ANALYSIS } from "@/data/products";
import { useContent } from "@/contexts/ContentContext";

const SCORE_DIMENSIONS = [
  { key: "entity_clarity", label: "Entity Clarity", score: 65 },
  { key: "category_ownership", label: "Category Ownership", score: 52 },
  { key: "educational_authority", label: "Educational Authority", score: 45 },
  { key: "prompt_coverage", label: "Prompt Coverage", score: 28 },
  { key: "comparison_coverage", label: "Comparison Coverage", score: 15 },
  { key: "ecosystem_coverage", label: "Ecosystem Coverage", score: 38 },
  { key: "structure_quality", label: "Structure Quality", score: 58 },
];

const OVERALL_SCORE = 42;

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[10px] text-muted-foreground font-mono">—</span>;
  const color = score >= 65 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : score >= 45 ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
    : "text-red-400 bg-red-500/10 border-red-500/20";
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tabular-nums font-mono ${color}`}>{score}</span>;
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { products } = useContent();
  const [selectedProductId, setSelectedProductId] = useState(() => products[0]?.id ?? "");
  const [running, setRunning] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? products[0],
    [products, selectedProductId]
  );

  const prompts = getProductPrompts(selectedProductId);
  const coveredPrompts = prompts.filter((p) => p.covered);

  // Build per-item analysis list
  const contentItems = useMemo(() => {
    if (!selectedProduct) return [];
    return selectedProduct.folders.flatMap((f) =>
      f.items.map((item) => ({
        ...item,
        folderName: f.name,
        analysis: CONTENT_ANALYSIS[item.id] ?? null,
        gapCount: CONTENT_ANALYSIS[item.id]?.gaps.length ?? 0,
        criticalGaps: CONTENT_ANALYSIS[item.id]?.gaps.filter((g) => g.severity === "critical").length ?? 0,
      }))
    ).sort((a, b) => (a.score ?? 999) - (b.score ?? 999)); // worst scores first
  }, [selectedProduct]);

  const analyzedItems = contentItems.filter((i) => i.status === "analyzed");
  const totalGaps = contentItems.reduce((s, i) => s + i.gapCount, 0);
  const criticalGaps = contentItems.reduce((s, i) => s + i.criticalGaps, 0);

  function handleRun() {
    setRunning(true);
    toast.success("Re-analyzing all content...");
    setTimeout(() => { setRunning(false); toast.success("Analysis complete!"); }, 2500);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Gap Analysis</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Aggregate AI visibility analysis across all content — click any item to open its pipeline
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none">
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={handleRun} disabled={running}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "Analyzing..." : "Re-analyze All"}
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">How Gap Analysis Works</p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <FileText className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-medium">Ingested Content</p>
              <p className="text-[10px] text-muted-foreground">{contentItems.length} items</p>
            </div>
          </div>
          <span className="text-muted-foreground text-lg">+</span>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-medium">Prompt Database</p>
              <p className="text-[10px] text-muted-foreground">{prompts.length} prompts ({coveredPrompts.length} covered)</p>
            </div>
          </div>
          <span className="text-muted-foreground text-lg">=</span>
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-medium text-primary">Visibility Gaps</p>
              <p className="text-[10px] text-muted-foreground">{totalGaps} gaps ({criticalGaps} critical)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Score overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center">
          <ScoreRing score={OVERALL_SCORE} size={180} />
          <p className="text-xs text-muted-foreground mt-3 text-center">Product AI Visibility Score</p>
        </div>
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4 text-sm">Score Dimensions</h2>
          <div className="space-y-3">
            {SCORE_DIMENSIONS.map((dim) => (
              <ScoreBar key={dim.key} label={dim.label} score={dim.score} />
            ))}
          </div>
        </div>
      </div>

      {/* Per-item analysis table — the core of this aggregate view */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" /> Content Items — Sorted by Worst Score
          </h2>
          <span className="text-xs text-muted-foreground">{analyzedItems.length} analyzed / {contentItems.length} total</span>
        </div>
        <div className="divide-y divide-border/50">
          {contentItems.map((item) => {
            const isAnalyzed = item.status === "analyzed";
            return (
              <button
                key={item.id}
                onClick={() => navigate(`/dashboard/content/${item.id}`)}
                className="flex items-center gap-4 px-5 py-3 hover:bg-accent/20 transition-colors w-full text-left group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground/50">{item.folderName} · {item.source_type}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {isAnalyzed && item.criticalGaps > 0 && (
                    <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 font-medium">
                      {item.criticalGaps} critical
                    </span>
                  )}
                  {isAnalyzed && (
                    <span className="text-[10px] text-muted-foreground">
                      {item.gapCount} gap{item.gapCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  <ScoreBadge score={item.score} />
                  {!isAnalyzed && (
                    <span className="text-[10px] text-yellow-400 animate-pulse">processing…</span>
                  )}
                  <ArrowRight className="h-3 w-3 text-muted-foreground/20 group-hover:text-primary transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/dashboard/prompts" className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors group">
          <MessageSquare className="h-5 w-5 text-primary mb-2" />
          <p className="text-sm font-semibold mb-0.5">Manage Prompts</p>
          <p className="text-xs text-muted-foreground">Add prompts to improve coverage analysis</p>
        </Link>
        <Link to="/dashboard/content" className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors group">
          <FileText className="h-5 w-5 text-primary mb-2" />
          <p className="text-sm font-semibold mb-0.5">Content Library</p>
          <p className="text-xs text-muted-foreground">Ingest more content to improve scores</p>
        </Link>
        <Link to="/dashboard/content/generate" className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors group">
          <Sparkles className="h-5 w-5 text-primary mb-2" />
          <p className="text-sm font-semibold mb-0.5">Generate Queue</p>
          <p className="text-xs text-muted-foreground">Generate AI-optimized content for gap items</p>
        </Link>
      </div>
    </div>
  );
}
