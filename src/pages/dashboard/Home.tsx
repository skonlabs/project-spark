import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Clock,
  File, Folder, Package2, Plus, Sparkles, Upload, X,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { MOCK_PRODUCTS, getAllContent, getProductStats, CONTENT_ANALYSIS } from "@/data/products";

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[10px] text-muted-foreground font-mono">—</span>;
  const color = score >= 65 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
    : score >= 45 ? "bg-amber-500/10 text-amber-400 border-amber-500/15"
    : "bg-red-500/10 text-red-400 border-red-500/15";
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tabular-nums font-mono ${color}`}>{score}</span>;
}

function RelativeTime({ iso }: { iso: string }) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  if (days > 0) return <>{days}d ago</>;
  if (hours > 0) return <>{hours}h ago</>;
  return <>just now</>;
}

export default function HomePage() {
  const [showQuickIngest, setShowQuickIngest] = useState(false);
  const [ingestUrl, setIngestUrl] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0].id);
  const [selectedFolder, setSelectedFolder] = useState(MOCK_PRODUCTS[0].folders[0].id);

  const recentContent = getAllContent()
    .filter((c) => c.item.status === "analyzed")
    .sort((a, b) => new Date(b.item.ingested_at).getTime() - new Date(a.item.ingested_at).getTime())
    .slice(0, 5);

  const allContent = getAllContent();
  const criticalItems = allContent.filter((c) => {
    const a = CONTENT_ANALYSIS[c.item.id];
    return a?.gaps.some((g) => g.severity === "critical");
  });

  function handleIngest() {
    if (!ingestUrl) return;
    toast.success("Content ingested — analysis will complete shortly.");
    setIngestUrl(""); setShowQuickIngest(false);
  }

  const product = MOCK_PRODUCTS.find((p) => p.id === selectedProduct);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>Your Products</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Select a content item from the sidebar to analyze</p>
        </div>
        <button onClick={() => setShowQuickIngest(true)} className="btn-primary text-xs px-4 py-2">
          <Upload className="h-3.5 w-3.5" /> Ingest Content
        </button>
      </motion.div>

      {/* How it works */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bento-card bg-gradient-to-br from-primary/5 to-transparent"
      >
        <h2 className="font-semibold mb-4 text-xs flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> How GAEO works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          {[
            { step: "1", icon: Upload, title: "Ingest", desc: "Add existing content by URL or file upload." },
            { step: "2", icon: Sparkles, title: "Analyze", desc: "Scores across 7 AI visibility dimensions." },
            { step: "3", icon: File, title: "Generate", desc: "AI-enhanced version for LLM citation." },
            { step: "4", icon: CheckCircle2, title: "Publish", desc: "Publish to CMS, watch visibility climb." },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-primary border border-primary/15">{s.step}</div>
                <div>
                  <p className="text-xs font-semibold flex items-center gap-1"><Icon className="h-3 w-3 text-primary" />{s.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_PRODUCTS.map((product, i) => {
          const stats = getProductStats(product.id)!;
          const allItems = product.folders.flatMap((f) => f.items);
          const criticalCount = allItems.filter((i) => { const a = CONTENT_ANALYSIS[i.id]; return a?.gaps.some((g) => g.severity === "critical"); }).length;
          return (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bento-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/15 to-purple-500/10 flex items-center justify-center border border-primary/10">
                    <Package2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ fontFamily: "'Space Grotesk'" }}>{product.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{product.category}</p>
                  </div>
                </div>
                {stats.avgScore !== null && <ScoreBadge score={stats.avgScore} />}
              </div>
              <div className="space-y-1.5 mb-4">
                {product.folders.map((folder) => (
                  <div key={folder.id} className="flex items-center gap-2 text-xs">
                    <Folder className="h-3 w-3 text-amber-500/60 flex-shrink-0" />
                    <span className="text-muted-foreground">{folder.name}</span>
                    <span className="text-[10px] bg-muted/40 rounded px-1.5 py-0.5 ml-auto tabular-nums font-mono">{folder.items.length}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground border-t border-border/30 pt-3">
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-400" />{stats.analyzed}/{stats.total}</span>
                {criticalCount > 0 && <span className="flex items-center gap-1 text-red-400"><AlertTriangle className="h-3 w-3" />{criticalCount} critical</span>}
                <a href={`https://${product.url}`} target="_blank" rel="noreferrer" className="ml-auto hover:text-foreground font-mono">{product.url}</a>
              </div>
            </motion.div>
          );
        })}

        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          onClick={() => toast.success("Create product — coming soon!")}
          className="rounded-2xl border-2 border-dashed border-border/30 p-5 flex flex-col items-center justify-center gap-3 text-muted-foreground/40 hover:text-muted-foreground hover:border-primary/20 hover:bg-primary/5 transition-all min-h-[180px]"
        >
          <Plus className="h-6 w-6" />
          <p className="text-xs font-semibold">Add Product</p>
        </motion.button>
      </div>

      {/* Needs attention */}
      {criticalItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="section-card">
          <div className="section-card-header">
            <h2 className="font-semibold text-sm flex items-center gap-2" style={{ fontFamily: "'Space Grotesk'" }}>
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> Needs Attention
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold border border-red-500/15">{criticalItems.length}</span>
            </h2>
          </div>
          <div className="divide-y divide-border/30">
            {criticalItems.slice(0, 4).map(({ product, folder, item }) => (
              <Link key={item.id} to={`/dashboard/content/${item.id}`} className="flex items-center gap-3 px-6 py-3 hover:bg-accent/20 transition-colors group">
                <File className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground/50">{product.name} / {folder.name}</p>
                </div>
                <ScoreBadge score={item.score} />
                <ChevronRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent content */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="section-card">
        <div className="section-card-header">
          <h2 className="font-semibold text-sm flex items-center gap-2" style={{ fontFamily: "'Space Grotesk'" }}>
            <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Recently Analyzed
          </h2>
        </div>
        <div className="divide-y divide-border/30">
          {recentContent.map(({ product, folder, item }) => (
            <Link key={item.id} to={`/dashboard/content/${item.id}`} className="flex items-center gap-3 px-6 py-3 hover:bg-accent/20 transition-colors group">
              <File className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.title}</p>
                <p className="text-[10px] text-muted-foreground/50">{product.name} / {folder.name} · <RelativeTime iso={item.ingested_at} /></p>
              </div>
              <ScoreBadge score={item.score} />
              <ArrowRight className="h-3 w-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Quick Ingest Modal */}
      {showQuickIngest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowQuickIngest(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border/40 rounded-2xl p-6 w-full max-w-md shadow-2xl gradient-border" onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-sm flex items-center gap-2" style={{ fontFamily: "'Space Grotesk'" }}><Upload className="h-4 w-4" /> Ingest Content</h2>
              <button onClick={() => setShowQuickIngest(false)}><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Product</label>
                <select value={selectedProduct} onChange={(e) => { setSelectedProduct(e.target.value); const p = MOCK_PRODUCTS.find((p) => p.id === e.target.value); if (p) setSelectedFolder(p.folders[0].id); }} className="input-field">
                  {MOCK_PRODUCTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Folder</label>
                <select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)} className="input-field">
                  {(product?.folders ?? []).map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Page URL</label>
                <input type="url" placeholder="https://example.com/blog/my-article" value={ingestUrl} onChange={(e) => setIngestUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleIngest()} className="input-field" autoFocus />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleIngest} disabled={!ingestUrl} className="btn-primary flex-1 justify-center py-2.5 text-sm">Ingest & Analyze</button>
              <button onClick={() => setShowQuickIngest(false)} className="rounded-xl border border-border/40 px-4 py-2.5 text-sm hover:bg-accent/50 transition-colors">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
