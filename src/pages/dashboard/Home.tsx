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
  if (score === null) return <span className="text-xs text-muted-foreground">Pending</span>;
  const color = score >= 65 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
    : score >= 45 ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
    : "bg-red-500/15 text-red-400 border-red-500/20";
  return <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${color} tabular-nums`}>{score}/100</span>;
}

function RelativeTime({ iso }: { iso: string }) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  if (days > 0) return <>{days}d ago</>;
  if (hours > 0) return <>{hours}h ago</>;
  return <>just now</>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

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
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="page-header pb-0">
          <h1>Your Products</h1>
          <p>Select a content item from the sidebar to analyze and optimize it</p>
        </div>
        <button onClick={() => setShowQuickIngest(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all shadow-lg shadow-primary/20">
          <Upload className="h-4 w-4" /> Ingest Content
        </button>
      </motion.div>

      {/* How it works */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-transparent p-6 backdrop-blur-sm">
        <h2 className="font-bold mb-4 text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> How GAEO works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          {[
            { step: "1", icon: Upload, title: "Ingest Content", desc: "Add your existing content — blog posts, docs, landing pages — by URL or file upload." },
            { step: "2", icon: Sparkles, title: "AI Analysis", desc: "GAEO scores each piece across 7 AI visibility dimensions and identifies specific gaps." },
            { step: "3", icon: File, title: "Generate & Edit", desc: "Generate an AI-enhanced version with the right structure for LLM citation." },
            { step: "4", icon: CheckCircle2, title: "Publish", desc: "Publish improved content directly to your CMS and watch your AI visibility climb." },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-black text-primary border border-primary/20">{s.step}</div>
                <div>
                  <p className="text-sm font-semibold flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-primary" />{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MOCK_PRODUCTS.map((product, i) => {
          const stats = getProductStats(product.id)!;
          const allItems = product.folders.flatMap((f) => f.items);
          const criticalCount = allItems.filter((i) => { const a = CONTENT_ANALYSIS[i.id]; return a?.gaps.some((g) => g.severity === "critical"); }).length;
          return (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/15 to-purple-500/10 flex items-center justify-center border border-primary/10">
                    <Package2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                </div>
                {stats.avgScore !== null && <ScoreBadge score={stats.avgScore} />}
              </div>
              <div className="space-y-2 mb-4">
                {product.folders.map((folder) => (
                  <div key={folder.id} className="flex items-center gap-2 text-sm">
                    <Folder className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{folder.name}</span>
                    <span className="text-xs bg-muted/60 rounded-md px-2 py-0.5 ml-auto tabular-nums font-medium">{folder.items.length} items</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/60 pt-3">
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />{stats.analyzed}/{stats.total} analyzed</span>
                {criticalCount > 0 && <span className="flex items-center gap-1 text-red-400"><AlertTriangle className="h-3.5 w-3.5" />{criticalCount} critical</span>}
                <a href={`https://${product.url}`} target="_blank" rel="noreferrer" className="ml-auto hover:text-foreground hover:underline">{product.url}</a>
              </div>
            </motion.div>
          );
        })}

        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          onClick={() => toast.success("Create product — coming soon!")}
          className="rounded-2xl border-2 border-dashed border-border/60 p-5 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all min-h-[180px]"
        >
          <div className="h-10 w-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center">
            <Plus className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold">Add Product</p>
          <p className="text-xs text-center">Create a new product and start ingesting content</p>
        </motion.button>
      </div>

      {/* Needs attention */}
      {criticalItems.length > 0 && (
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" /> Needs Attention
              <span className="text-xs bg-red-500/15 text-red-400 px-2.5 py-0.5 rounded-full font-bold">{criticalItems.length}</span>
            </h2>
            <p className="text-xs text-muted-foreground">Content with critical AI visibility gaps</p>
          </div>
          <div className="divide-y divide-border/60">
            {criticalItems.slice(0, 5).map(({ product, folder, item }) => {
              const analysis = CONTENT_ANALYSIS[item.id];
              const criticalGaps = analysis?.gaps.filter((g) => g.severity === "critical") ?? [];
              return (
                <Link key={item.id} to={`/dashboard/content/${item.id}`} className="flex items-center gap-3 px-6 py-4 hover:bg-accent/30 transition-colors group">
                  <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{product.name} / {folder.name} · {criticalGaps.length} critical gap{criticalGaps.length !== 1 ? "s" : ""}</p>
                  </div>
                  <ScoreBadge score={item.score} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent content */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="font-bold flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> Recently Analyzed</h2>
        </div>
        <div className="divide-y divide-border/60">
          {recentContent.map(({ product, folder, item }) => (
            <Link key={item.id} to={`/dashboard/content/${item.id}`} className="flex items-center gap-3 px-6 py-3.5 hover:bg-accent/30 transition-colors group">
              <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">{product.name} / {folder.name} · <RelativeTime iso={item.ingested_at} /></p>
              </div>
              <ScoreBadge score={item.score} />
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Ingest Modal */}
      {showQuickIngest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowQuickIngest(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border/60 rounded-2xl p-6 w-full max-w-md shadow-2xl gradient-border" onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold flex items-center gap-2"><Upload className="h-4 w-4" /> Ingest Content</h2>
              <button onClick={() => setShowQuickIngest(false)}><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Product</label>
                <select value={selectedProduct} onChange={(e) => { setSelectedProduct(e.target.value); const p = MOCK_PRODUCTS.find((p) => p.id === e.target.value); if (p) setSelectedFolder(p.folders[0].id); }}
                  className="w-full rounded-xl border border-input bg-background/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                >
                  {MOCK_PRODUCTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Folder</label>
                <select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                >
                  {(product?.folders ?? []).map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Page URL</label>
                <input type="url" placeholder="https://example.com/blog/my-article" value={ingestUrl} onChange={(e) => setIngestUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleIngest()}
                  className="w-full rounded-xl border border-input bg-background/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50" autoFocus
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleIngest} disabled={!ingestUrl}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-primary/20"
              >Ingest & Analyze</button>
              <button onClick={() => setShowQuickIngest(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm hover:bg-accent transition-colors">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
