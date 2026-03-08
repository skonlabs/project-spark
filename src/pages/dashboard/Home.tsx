import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, ArrowUpRight, BarChart3, Brain, CheckCircle2,
  ChevronRight, Clock, File, FileText, Folder, Monitor, Package2, Plus,
  Sparkles, Swords, Upload, X, Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { MOCK_PRODUCTS, getAllContent, getProductStats, CONTENT_ANALYSIS } from "@/data/products";
import { ScoreRing } from "@/components/dashboard/ScoreRing";

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[10px] text-muted-foreground font-mono">—</span>;
  const color = score >= 65 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : score >= 45 ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
    : "text-red-400 bg-red-500/10 border-red-500/20";
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

  // Aggregate stats
  const totalContent = allContent.length;
  const analyzedContent = allContent.filter(c => c.item.status === "analyzed").length;
  const avgScore = Math.round(allContent.filter(c => c.item.score !== null).reduce((sum, c) => sum + (c.item.score ?? 0), 0) / Math.max(1, allContent.filter(c => c.item.score !== null).length));

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1200px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your AI Engine Optimization command center</p>
        </div>
        <button onClick={() => setShowQuickIngest(true)} className="btn-primary text-xs px-4 py-2">
          <Upload className="h-3.5 w-3.5" /> Ingest Content
        </button>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "AI Visibility Score", value: String(avgScore), suffix: "/100", change: "+3 this week", positive: true, icon: BarChart3 },
          { label: "LLM Mention Rate", value: "18", suffix: "%", change: "-2% vs last week", positive: false, icon: Brain },
          { label: "Content Assets", value: String(totalContent), suffix: ` (${analyzedContent} analyzed)`, change: "+12 this month", positive: true, icon: FileText },
          { label: "Critical Issues", value: String(criticalItems.length), suffix: " items", change: "Needs attention", positive: false, icon: Monitor },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="h-4 w-4 text-muted-foreground/50" />
                <span className={`text-[10px] font-medium ${stat.positive ? "text-emerald-400" : "text-red-400"}`}>{stat.change}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-heading font-extrabold tabular-nums">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.suffix}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Score + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="bento-card flex flex-col items-center py-8"
        >
          <h2 className="font-heading font-semibold text-sm mb-5">AI Visibility Score</h2>
          <ScoreRing score={avgScore} size={180} />
          <p className="text-xs text-muted-foreground mt-5 text-center">
            You appear in <strong className="text-foreground">18%</strong> of AI-generated answers
          </p>
          <Link to="/dashboard/analysis" className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
            Full analysis <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2 space-y-3"
        >
          {/* Quick actions */}
          {[
            { title: "Run LLM Simulation", description: "Test how AI models respond to queries about your product", icon: Brain, href: "/dashboard/simulation", cta: "Run simulation" },
            { title: "Analyze Competitors", description: "See your share of voice vs competitors across AI engines", icon: Swords, href: "/dashboard/competitive", cta: "View competitive" },
            { title: "Generate Content", description: "Create AI-optimized articles, FAQs, and comparisons", icon: Zap, href: "/dashboard/content/generate", cta: "Generate" },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.href} className="bento-card flex items-center gap-4 group">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-sm">{action.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                </div>
                <span className="text-xs text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {action.cta} <ArrowUpRight className="h-3 w-3" />
                </span>
              </Link>
            );
          })}
        </motion.div>
      </div>

      {/* Products */}
      <div>
        <h2 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
          <Package2 className="h-4 w-4 text-muted-foreground" /> Your Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MOCK_PRODUCTS.map((product, i) => {
            const stats = getProductStats(product.id)!;
            const allItems = product.folders.flatMap((f) => f.items);
            const criticalCount = allItems.filter((item) => { const a = CONTENT_ANALYSIS[item.id]; return a?.gaps.some((g) => g.severity === "critical"); }).length;
            return (
              <motion.div key={product.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }} className="bento-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/10">
                      <Package2 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm">{product.name}</h3>
                      <p className="text-[10px] text-muted-foreground">{product.category}</p>
                    </div>
                  </div>
                  {stats.avgScore !== null && <ScoreBadge score={stats.avgScore} />}
                </div>
                <div className="space-y-1 mb-3">
                  {product.folders.map((folder) => (
                    <div key={folder.id} className="flex items-center gap-2 text-xs">
                      <Folder className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
                      <span className="text-muted-foreground truncate">{folder.name}</span>
                      <span className="text-[10px] bg-muted/50 rounded px-1.5 py-0.5 ml-auto tabular-nums font-mono text-muted-foreground/60">{folder.items.length}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground border-t border-border pt-3">
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-400" />{stats.analyzed}/{stats.total}</span>
                  {criticalCount > 0 && <span className="flex items-center gap-1 text-red-400"><AlertTriangle className="h-3 w-3" />{criticalCount} critical</span>}
                  <a href={`https://${product.url}`} target="_blank" rel="noreferrer" className="ml-auto hover:text-foreground font-mono text-muted-foreground/40">{product.url}</a>
                </div>
              </motion.div>
            );
          })}

          <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            onClick={() => toast.success("Create product — coming soon!")}
            className="rounded-xl border-2 border-dashed border-border/30 p-5 flex flex-col items-center justify-center gap-2 text-muted-foreground/30 hover:text-muted-foreground hover:border-primary/20 hover:bg-primary/[0.02] transition-all min-h-[160px]"
          >
            <Plus className="h-6 w-6" />
            <p className="text-xs font-medium">Add Product</p>
          </motion.button>
        </div>
      </div>

      {/* Needs attention */}
      {criticalItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="section-card">
          <div className="section-card-header">
            <h2 className="font-heading font-semibold text-sm flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> Needs Attention
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold border border-red-500/15">{criticalItems.length}</span>
            </h2>
          </div>
          <div className="divide-y divide-border/40">
            {criticalItems.slice(0, 4).map(({ product, folder, item }) => (
              <Link key={item.id} to={`/dashboard/content/${item.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/20 transition-colors group">
                <File className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground/40">{product.name} / {folder.name}</p>
                </div>
                <ScoreBadge score={item.score} />
                <ChevronRight className="h-3 w-3 text-muted-foreground/20 group-hover:text-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recently analyzed */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="section-card">
        <div className="section-card-header">
          <h2 className="font-heading font-semibold text-sm flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground/50" /> Recently Analyzed
          </h2>
          <Link to="/dashboard/content" className="text-xs text-primary hover:underline font-medium">View all</Link>
        </div>
        <div className="divide-y divide-border/40">
          {recentContent.map(({ product, folder, item }) => (
            <Link key={item.id} to={`/dashboard/content/${item.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/20 transition-colors group">
              <File className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.title}</p>
                <p className="text-[10px] text-muted-foreground/40">{product.name} / {folder.name} · <RelativeTime iso={item.ingested_at} /></p>
              </div>
              <ScoreBadge score={item.score} />
              <ArrowRight className="h-3 w-3 text-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Quick Ingest Modal */}
      {showQuickIngest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowQuickIngest(false)}>
          <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-sm flex items-center gap-2"><Upload className="h-4 w-4" /> Ingest Content</h2>
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
              <button onClick={() => setShowQuickIngest(false)} className="btn-secondary px-4 py-2.5 text-sm">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
