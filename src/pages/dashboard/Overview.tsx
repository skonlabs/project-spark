import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, BarChart3, Brain, FileText,
  Monitor, Plus, Swords, TrendingUp, Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { ScoreBar } from "@/components/dashboard/ScoreBar";

export default function OverviewPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1200px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">AI Visibility Overview</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your AI Engine Optimization command center</p>
        </div>
        <Link to="/dashboard/projects" className="btn-primary text-xs px-4 py-2">
          <Plus className="h-3.5 w-3.5" /> New Project
        </Link>
      </motion.div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "AI Visibility Score", value: "42", suffix: "/100", change: "+3 this week", positive: true, icon: BarChart3 },
          { label: "LLM Mention Rate", value: "18", suffix: "%", change: "-2% vs last week", positive: false, icon: Brain },
          { label: "Content Assets", value: "47", suffix: " docs", change: "+12 this month", positive: true, icon: FileText },
          { label: "Active Alerts", value: "3", suffix: " new", change: "2 critical", positive: false, icon: Monitor },
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

      {/* Score + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="bento-card flex flex-col items-center py-8"
        >
          <h2 className="font-heading font-semibold text-sm mb-5">AI Visibility Score</h2>
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
            <h2 className="font-heading font-semibold text-sm">Score Breakdown</h2>
            <span className="text-[10px] text-muted-foreground/40">8 dimensions</span>
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
          { title: "Run LLM Simulation", description: "Test how AI models respond to your prompts", icon: Brain, href: "/dashboard/simulation", cta: "Run simulation" },
          { title: "Analyze Competitors", description: "See your share of voice vs competitors", icon: Swords, href: "/dashboard/competitive", cta: "View competitive" },
          { title: "Generate Content", description: "Create AI-optimized articles and FAQs", icon: Zap, href: "/dashboard/content/generate", cta: "Generate now" },
        ].map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div key={action.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}>
              <Link to={action.href} className="bento-card block group">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-sm mb-1">{action.title}</h3>
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
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="section-card">
        <div className="section-card-header">
          <h2 className="font-heading font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Content Roadmap
          </h2>
          <Link to="/dashboard/analysis" className="text-xs text-primary hover:underline font-medium">View all</Link>
        </div>
        <div className="divide-y divide-border/40">
          {[
            { priority: 1, title: "What is AI observability? Complete guide", type: "guide", prompts: ["what is ai observability", "ai observability explained"] },
            { priority: 2, title: "Best AI observability tools in 2026", type: "comparison", prompts: ["best ai monitoring tools"] },
            { priority: 3, title: "AI observability vs traditional monitoring", type: "comparison", prompts: ["ai observability vs monitoring"] },
          ].map((item) => (
            <div key={item.priority} className="flex items-start gap-3 px-5 py-3.5 hover:bg-accent/15 transition-colors">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-primary border border-primary/15">{item.priority}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5 font-mono">{item.prompts.join(", ")}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${item.type === "guide" ? "bg-info/10 text-info border-info/15" : "bg-warning/10 text-warning border-warning/15"}`}>
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
