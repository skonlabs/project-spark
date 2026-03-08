import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  FileText,
  Monitor,
  Plus,
  Swords,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { ScoreBar } from "@/components/dashboard/ScoreBar";

export default function OverviewPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>AI Visibility Overview</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your AI Engine Optimization command center</p>
        </div>
        <Link to="/dashboard/projects" className="btn-primary text-xs px-4 py-2">
          <Plus className="h-3.5 w-3.5" /> New Project
        </Link>
      </motion.div>

      {/* Bento stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "AI Visibility Score", value: "42", suffix: "/100", change: "+3 this week", positive: true, icon: BarChart3, gradient: "from-violet-500/15 to-purple-500/5" },
          { label: "LLM Mention Rate", value: "18", suffix: "%", change: "-2% vs last week", positive: false, icon: Brain, gradient: "from-blue-500/15 to-cyan-500/5" },
          { label: "Content Assets", value: "47", suffix: " docs", change: "+12 this month", positive: true, icon: FileText, gradient: "from-emerald-500/15 to-green-500/5" },
          { label: "Active Alerts", value: "3", suffix: " new", change: "2 critical", positive: false, icon: Monitor, gradient: "from-rose-500/15 to-red-500/5" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={`bento-card bg-gradient-to-br ${stat.gradient}`}
            >
              <Icon className="h-4 w-4 text-muted-foreground mb-3" />
              <div className="flex items-end gap-1">
                <span className="text-2xl font-black tabular-nums" style={{ fontFamily: "'Space Grotesk'" }}>{stat.value}</span>
                <span className="text-muted-foreground text-xs mb-0.5">{stat.suffix}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
              <p className={`text-[10px] mt-1 font-medium ${stat.positive ? "text-emerald-400" : "text-red-400"}`}>{stat.change}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Score + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="bento-card flex flex-col items-center py-8"
        >
          <h2 className="font-semibold text-sm mb-5" style={{ fontFamily: "'Space Grotesk'" }}>AI Visibility Score</h2>
          <ScoreRing score={42} size={180} />
          <p className="text-xs text-muted-foreground mt-5 text-center">
            You appear in <strong className="text-foreground">18%</strong> of AI answers
          </p>
          <Link to="/dashboard/analysis" className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
            Full analysis <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2 bento-card"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-sm" style={{ fontFamily: "'Space Grotesk'" }}>Score Breakdown</h2>
            <span className="text-[10px] text-muted-foreground/50">10 dimensions</span>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Entity Clarity", score: 65, description: "How clearly your product is defined" },
              { label: "Prompt Coverage", score: 28, description: "% of AI prompts your content answers" },
              { label: "Educational Authority", score: 45, description: "Depth of educational content" },
              { label: "Category Ownership", score: 52, description: "Association with your category" },
              { label: "Comparison Coverage", score: 15, description: "vs/comparison content" },
              { label: "Ecosystem Coverage", score: 38, description: "Coverage of related topics" },
              { label: "External Authority", score: 30, description: "Third-party mentions" },
              { label: "Consistency Score", score: 72, description: "Consistency of messaging" },
            ].map((item) => (
              <ScoreBar key={item.label} {...item} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { title: "Run LLM Simulation", description: "Test how AI models respond to your prompts", icon: Brain, href: "/dashboard/simulation", gradient: "from-violet-500 to-purple-600", cta: "Run simulation" },
          { title: "Analyze Competitors", description: "See your share of voice vs competitors", icon: Swords, href: "/dashboard/competitive", gradient: "from-orange-500 to-amber-600", cta: "View competitive" },
          { title: "Generate Content", description: "Create AI-optimized articles and FAQs", icon: Zap, href: "/dashboard/content/generate", gradient: "from-emerald-500 to-green-600", cta: "Generate now" },
        ].map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div key={action.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}>
              <Link to={action.href} className="bento-card block group">
                <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1" style={{ fontFamily: "'Space Grotesk'" }}>{action.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{action.description}</p>
                <span className="inline-flex items-center gap-1 text-xs text-primary group-hover:gap-2 transition-all font-medium">
                  {action.cta} <ArrowUpRight className="h-3 w-3" />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Content roadmap */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="section-card">
        <div className="section-card-header">
          <h2 className="font-semibold text-sm flex items-center gap-2" style={{ fontFamily: "'Space Grotesk'" }}>
            <TrendingUp className="h-4 w-4 text-primary" /> Content Roadmap
          </h2>
          <Link to="/dashboard/analysis" className="text-xs text-primary hover:underline font-medium">View all</Link>
        </div>
        <div className="divide-y divide-border/30">
          {[
            { priority: 1, title: "What is AI observability? Complete guide", type: "guide", prompts: ["what is ai observability", "ai observability explained"] },
            { priority: 2, title: "Best AI observability tools in 2026", type: "comparison", prompts: ["best ai monitoring tools"] },
            { priority: 3, title: "AI observability vs traditional monitoring", type: "comparison", prompts: ["ai observability vs monitoring"] },
          ].map((item) => (
            <div key={item.priority} className="flex items-start gap-3 px-6 py-3.5 hover:bg-accent/20 transition-colors">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-primary border border-primary/15">{item.priority}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-mono">{item.prompts.join(", ")}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.type === "guide" ? "bg-blue-500/10 text-blue-400 border border-blue-500/15" : "bg-orange-500/10 text-orange-400 border border-orange-500/15"}`}>
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
