import { Link } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, ArrowUpRight, BarChart3, Brain, CheckCircle2,
  ChevronRight, Clock, File, FileText, Folder, Monitor, Package2, Plus,
  Sparkles, Swords, Upload, Zap, Send,
} from "lucide-react";
import { motion } from "framer-motion";
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
  const allContent = getAllContent();
  const recentContent = allContent
    .filter((c) => c.item.status === "analyzed")
    .sort((a, b) => new Date(b.item.ingested_at).getTime() - new Date(a.item.ingested_at).getTime())
    .slice(0, 5);

  const criticalItems = allContent.filter((c) => {
    const a = CONTENT_ANALYSIS[c.item.id];
    return a?.gaps.some((g) => g.severity === "critical");
  });

  const totalContent = allContent.length;
  const analyzedContent = allContent.filter(c => c.item.status === "analyzed").length;
  const lowScoreItems = allContent.filter(c => c.item.score !== null && c.item.score < 65).length;
  const avgScore = Math.round(allContent.filter(c => c.item.score !== null).reduce((sum, c) => sum + (c.item.score ?? 0), 0) / Math.max(1, allContent.filter(c => c.item.score !== null).length));

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1200px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your AI Engine Optimization command center</p>
        </div>
        <Link to="/dashboard/content" className="btn-primary text-xs px-4 py-2">
          <Upload className="h-3.5 w-3.5" /> Ingest Content
        </Link>
      </motion.div>

      {/* KPI cards — each links to its aggregate dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "AI Visibility Score", value: String(avgScore), suffix: "/100", change: "+3 this week", positive: true, icon: BarChart3, href: "/dashboard/analysis" },
          { label: "Content Library", value: String(totalContent), suffix: ` (${analyzedContent} analyzed)`, change: `${lowScoreItems} need work`, positive: lowScoreItems === 0, icon: FileText, href: "/dashboard/content" },
          { label: "Critical Gaps", value: String(criticalItems.length), suffix: " items", change: "Click to view", positive: criticalItems.length === 0, icon: AlertTriangle, href: "/dashboard/analysis" },
          { label: "Ready to Generate", value: String(lowScoreItems), suffix: " items", change: "Score < 65", positive: false, icon: Sparkles, href: "/dashboard/content/generate" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={stat.href} className="stat-card block hover:border-primary/20 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="h-4 w-4 text-muted-foreground/50" />
                  <span className={`text-[10px] font-medium ${stat.positive ? "text-emerald-400" : "text-amber-400"}`}>{stat.change}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-heading font-extrabold tabular-nums">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.suffix}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Workflow pipeline — connected steps */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading font-semibold text-sm mb-4">Your Workflow Pipeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { step: 1, label: "Ingest", desc: `${totalContent} items in library`, href: "/dashboard/content", icon: Upload, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
            { step: 2, label: "Analyze Gaps", desc: `${criticalItems.length} critical gaps found`, href: "/dashboard/analysis", icon: BarChart3, color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
            { step: 3, label: "Generate", desc: `${lowScoreItems} items need content`, href: "/dashboard/content/generate", icon: Sparkles, color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
            { step: 4, label: "Edit", desc: "Review & refine content", href: "/dashboard/content", icon: FileText, color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
            { step: 5, label: "Publish", desc: "Publish to your CMS", href: "/dashboard/publish", icon: Send, color: "bg-green-500/10 text-green-400 border-green-500/20" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.step} to={s.href} className={`rounded-xl border p-4 hover:bg-accent/20 transition-colors group ${s.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold">{s.step}.</span>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-foreground">{s.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
              </Link>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">
          💡 Click any content item in the sidebar explorer to open its individual pipeline (Content → Analyze → Generate → Edit → Publish)
        </p>
      </motion.div>

      {/* Score + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
          className="bento-card flex flex-col items-center py-8">
          <h2 className="font-heading font-semibold text-sm mb-5">AI Visibility Score</h2>
          <ScoreRing score={avgScore} size={180} />
          <Link to="/dashboard/analysis" className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
            Full analysis <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-3">
          {[
            { title: "Run LLM Simulation", description: "Test how AI models respond to queries about your product", icon: Brain, href: "/dashboard/simulation", cta: "Run simulation" },
            { title: "Analyze Competitors", description: "See your share of voice vs competitors across AI engines", icon: Swords, href: "/dashboard/competitive", cta: "View competitive" },
            { title: "Discover Prompts", description: "Find prompts users ask AI about your category", icon: Sparkles, href: "/dashboard/prompts", cta: "View prompts" },
          ].map((action) => {
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

      {/* Needs attention */}
      {criticalItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="section-card">
          <div className="section-card-header">
            <h2 className="font-heading font-semibold text-sm flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> Needs Attention
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold border border-red-500/15">{criticalItems.length}</span>
            </h2>
            <Link to="/dashboard/analysis" className="text-xs text-primary hover:underline font-medium">View analysis</Link>
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
          <Link to="/dashboard/content" className="text-xs text-primary hover:underline font-medium">View library</Link>
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
    </div>
  );
}
