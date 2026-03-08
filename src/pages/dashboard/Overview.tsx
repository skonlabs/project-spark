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
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { ScoreBar } from "@/components/dashboard/ScoreBar";

export default function OverviewPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Visibility Overview</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your AI Engine Optimization command center</p>
        </div>
        <Link to="/dashboard/projects/new" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Project
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "AI Visibility Score", value: "42", suffix: "/100", change: "+3 this week", positive: true, icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "LLM Mention Rate", value: "18", suffix: "%", change: "-2% vs last week", positive: false, icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Content Assets", value: "47", suffix: " docs", change: "+12 this month", positive: true, icon: FileText, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Active Alerts", value: "3", suffix: " new", change: "2 critical", positive: false, icon: Monitor, color: "text-red-400", bg: "bg-red-500/10" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg} mb-3`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-muted-foreground text-sm mb-0.5">{stat.suffix}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              <p className={`text-xs mt-1 font-medium ${stat.positive ? "text-green-400" : "text-red-400"}`}>{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Score + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center">
          <h2 className="font-semibold mb-4">AI Visibility Score</h2>
          <ScoreRing score={42} size={180} />
          <p className="text-sm text-muted-foreground mt-4 text-center">
            You appear in <strong className="text-foreground">18%</strong> of AI answers about your category.
          </p>
          <Link to="/dashboard/analysis" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
            View full analysis <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Score Breakdown</h2>
            <span className="text-xs text-muted-foreground">Hover for details</span>
          </div>
          <div className="space-y-3">
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
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Run LLM Simulation", description: "Test how Claude, ChatGPT & Gemini respond to your prompts", icon: Brain, href: "/dashboard/simulation", color: "text-purple-400", bg: "bg-purple-500/10", cta: "Run simulation" },
          { title: "Analyze Competitors", description: "See your LLM share of voice vs competitors", icon: Swords, href: "/dashboard/competitive", color: "text-orange-400", bg: "bg-orange-500/10", cta: "View competitive" },
          { title: "Generate Content", description: "Create AI-optimized articles, FAQs and comparisons", icon: Zap, href: "/dashboard/content/generate", color: "text-yellow-400", bg: "bg-yellow-500/10", cta: "Generate now" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} to={action.href} className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all group">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${action.bg} mb-3`}>
                <Icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <h3 className="font-semibold mb-1">{action.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
              <span className="inline-flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
                {action.cta} <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          );
        })}
      </div>

      {/* Content roadmap */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Content Roadmap
          </h2>
          <Link to="/dashboard/analysis" className="text-sm text-primary hover:underline">View full roadmap</Link>
        </div>
        <div className="space-y-3">
          {[
            { priority: 1, title: "What is AI observability? Complete guide", type: "guide", prompts: ["what is ai observability", "ai observability explained"] },
            { priority: 2, title: "Best AI observability tools in 2026", type: "comparison", prompts: ["best ai monitoring tools", "top llm observability platforms"] },
            { priority: 3, title: "AI observability vs traditional monitoring", type: "comparison", prompts: ["ai observability vs monitoring"] },
            { priority: 4, title: "FAQ: Everything about AI observability", type: "faq", prompts: ["what does ai observability do"] },
          ].map((item) => (
            <div key={item.priority} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">{item.priority}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Targets: {item.prompts.join(", ")}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.type === "guide" ? "bg-blue-500/15 text-blue-400" : item.type === "comparison" ? "bg-orange-500/15 text-orange-400" : "bg-green-500/15 text-green-400"}`}>
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
