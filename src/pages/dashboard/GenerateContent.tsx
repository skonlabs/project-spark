import { useState, useMemo } from "react";
import {
  ArrowRight, CheckCircle2, ChevronRight, FileText, Loader2,
  Sparkles, Zap, AlertCircle, BarChart2, Send,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
// Analysis data now comes from useContent context
import { useContent } from "@/contexts/ContentContext";

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[10px] text-muted-foreground font-mono">—</span>;
  const color = score >= 65 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : score >= 45 ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
    : "text-red-400 bg-red-500/10 border-red-500/20";
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tabular-nums font-mono ${color}`}>{score}</span>;
}

export default function GenerateContentPage() {
  const navigate = useNavigate();
  const { products, getAnalysis } = useContent();
  const [selectedProductId, setSelectedProductId] = useState(() => products[0]?.id ?? "");
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? products[0],
    [products, selectedProductId]
  );

  // Items that have been analyzed and could benefit from generation
  const contentItems = useMemo(() => {
    if (!selectedProduct) return [];
    return selectedProduct.folders.flatMap((f) =>
      f.items.map((item) => ({
        ...item,
        folderName: f.name,
        analysis: getAnalysis(item.id),
        gapCount: getAnalysis(item.id)?.gaps.length ?? 0,
        criticalGaps: getAnalysis(item.id)?.gaps.filter((g) => g.severity === "critical").length ?? 0,
      }))
    ).filter((i) => i.status === "analyzed")
     .sort((a, b) => (a.score ?? 999) - (b.score ?? 999)); // worst first
  }, [selectedProduct]);

  const lowScoreItems = contentItems.filter((i) => (i.score ?? 100) < 65);

  function handleGenerate(itemId: string) {
    setGeneratingIds((prev) => new Set([...prev, itemId]));
    toast.success("Generating AI-enhanced content...");
    setTimeout(() => {
      setGeneratingIds((prev) => { const next = new Set(prev); next.delete(itemId); return next; });
      toast.success("Content generated! Opening editor...");
      navigate(`/dashboard/content/${itemId}`);
    }, 2200);
  }

  function handleBatchGenerate() {
    const ids = lowScoreItems.slice(0, 5).map((i) => i.id);
    setGeneratingIds(new Set(ids));
    toast.success(`Generating content for ${ids.length} items...`);
    setTimeout(() => {
      setGeneratingIds(new Set());
      toast.success("Batch generation complete!");
    }, 3500);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Content Generation Queue</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Items analyzed and ready for AI-enhanced content — click any item to open its pipeline
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none">
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {lowScoreItems.length > 0 && (
            <button onClick={handleBatchGenerate} disabled={generatingIds.size > 0}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {generatingIds.size > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate for {Math.min(lowScoreItems.length, 5)} worst items
            </button>
          )}
        </div>
      </div>

      {/* AI Content Guidelines */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> AI Content Guidelines
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Generated content follows these principles — what AI-enabled content must contain to be cited by LLMs:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { title: "Entity Definition", desc: 'Clear "X is Y" statement so LLMs know what you are' },
            { title: "Structured Headings", desc: "H2/H3 hierarchy — LLMs parse structure to extract answers" },
            { title: "FAQ Coverage", desc: "Q&A pairs matching user prompts — cited 3.2× more by LLMs" },
            { title: "Comparison Tables", desc: 'Structured vs. alternatives — appears in "best tools" queries' },
            { title: "Keyword Consistency", desc: "Natural repetition to build strong topic association" },
            { title: "Educational Depth", desc: "Authoritative content — LLMs prefer depth over promotion" },
          ].map((g) => (
            <div key={g.title} className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs font-semibold mb-0.5">{g.title}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{contentItems.length}</p>
          <p className="text-xs text-muted-foreground">Analyzed items</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{lowScoreItems.length}</p>
          <p className="text-xs text-muted-foreground">Need improvement (&lt;65)</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{contentItems.length - lowScoreItems.length}</p>
          <p className="text-xs text-muted-foreground">Good score (≥65)</p>
        </div>
      </div>

      {/* Content queue */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm">Items Ready for Generation</h2>
          <span className="text-xs text-muted-foreground">Sorted by worst score first</span>
        </div>

        {contentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground mb-2">No analyzed content yet</p>
            <Link to="/dashboard/content" className="text-xs text-primary hover:underline">Ingest content first →</Link>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {contentItems.map((item) => {
              const isGenerating = generatingIds.has(item.id);
              const needsWork = (item.score ?? 100) < 65;
              return (
                <div key={item.id} className={`flex items-center gap-4 px-5 py-3 ${needsWork ? "" : "opacity-60"}`}>
                  <div className="flex-1 min-w-0">
                    <button onClick={() => navigate(`/dashboard/content/${item.id}`)} className="text-left">
                      <p className="text-sm font-medium truncate hover:text-primary transition-colors">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground/50">{item.folderName} · {item.gapCount} gaps ({item.criticalGaps} critical)</p>
                    </button>
                  </div>
                  <ScoreBadge score={item.score} />
                  {needsWork ? (
                    <button
                      onClick={() => handleGenerate(item.id)}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors flex-shrink-0"
                    >
                      {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      {isGenerating ? "Generating..." : "Generate"}
                    </button>
                  ) : (
                    <span className="text-[10px] text-green-400 flex items-center gap-1 flex-shrink-0">
                      <CheckCircle2 className="h-3 w-3" /> Good
                    </span>
                  )}
                  <button onClick={() => navigate(`/dashboard/content/${item.id}`)} className="text-muted-foreground/30 hover:text-primary transition-colors flex-shrink-0">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation hint */}
      <div className="rounded-xl border border-border bg-card/50 p-4 flex items-center gap-4 flex-wrap">
        <p className="text-xs text-muted-foreground flex-1">
          <strong className="text-foreground">Tip:</strong> Click any item to open its full pipeline with the 5-step editor (Content → Gap Analysis → Generate → Edit → Publish).
        </p>
        <Link to="/dashboard/analysis" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
          <BarChart2 className="h-3 w-3" /> ← Back to Gap Analysis
        </Link>
        <Link to="/dashboard/publish" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
          Publish Queue <Send className="h-3 w-3" /> →
        </Link>
      </div>
    </div>
  );
}
