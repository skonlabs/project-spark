import { useState } from "react";
import {
  Bot,
  Brain,
  TrendingUp,
  FileText,
  Swords,
  Lightbulb,
  CheckCircle2,
  Clock,
  Loader2,
  Sparkles,
  Play,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

type SuggestionType = "content" | "optimization" | "competitive" | "monitoring";

interface AgentSuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  created_at: string;
}

const DEMO_SUGGESTIONS: AgentSuggestion[] = [
  {
    id: "1",
    type: "content",
    title: "Create 'Best AI Observability Tools 2026' comparison article",
    description: "This high-volume query appears in 87% of monitored prompts but you have zero coverage. Competitors LangSmith and Arize AI rank #1 and #2. Creating a comprehensive comparison article could move you into the top 5 within 30 days.",
    impact: "high",
    effort: "medium",
    status: "pending",
    created_at: "2026-03-08T09:00:00Z",
  },
  {
    id: "2",
    type: "optimization",
    title: "Improve entity definition clarity on your homepage",
    description: "Your homepage does not clearly state what GAEO Platform does within the first 2 sentences. LLMs scan the first 150 words to classify products. Adding 'GAEO Platform is the leading AI Engine Optimization platform' as the opening sentence is projected to increase entity clarity score from 65 → 82.",
    impact: "high",
    effort: "low",
    status: "pending",
    created_at: "2026-03-08T09:05:00Z",
  },
  {
    id: "3",
    type: "competitive",
    title: "LangSmith is now dominating 'LLM monitoring' prompts",
    description: "LangSmith's share of voice increased from 54% to 71% in the last 7 days on 'how to monitor LLM applications' prompts. They published 3 new educational articles. Recommend publishing 2 counter-articles within 14 days.",
    impact: "high",
    effort: "high",
    status: "in_progress",
    created_at: "2026-03-07T14:00:00Z",
  },
  {
    id: "4",
    type: "content",
    title: "Add FAQ section to product documentation",
    description: "FAQ-style content is cited 3.2x more often by LLMs than long-form prose. Your documentation lacks FAQ sections. Adding FAQs to your top 5 pages is projected to increase prompt coverage score from 28 → 45.",
    impact: "medium",
    effort: "low",
    status: "pending",
    created_at: "2026-03-07T10:00:00Z",
  },
  {
    id: "5",
    type: "monitoring",
    title: "Add Grok 2 to monitoring jobs",
    description: "Grok 2 is growing rapidly as an AI discovery surface, especially for developer and B2B queries. Your current monitoring does not include Grok. Adding it will give you full coverage across all 5 major LLMs.",
    impact: "medium",
    effort: "low",
    status: "completed",
    created_at: "2026-03-06T09:00:00Z",
  },
  {
    id: "6",
    type: "content",
    title: "Publish 'AI Observability vs Traditional Monitoring' article",
    description: "This comparison query ranks in the top 10 most frequent AI search prompts in your category. Your competitors cover it but you don't. The article should explain when to use specialized AI observability tools vs general APM solutions.",
    impact: "medium",
    effort: "medium",
    status: "pending",
    created_at: "2026-03-06T08:00:00Z",
  },
  {
    id: "7",
    type: "optimization",
    title: "Standardize product category labels across all content",
    description: "Inconsistency detected: your content uses 'AI observability', 'LLM monitoring', 'AI monitoring', and 'ML observability' interchangeably. LLMs reward category consistency. Standardizing to 'AI observability' would improve consistency score from 72 → 90.",
    impact: "medium",
    effort: "medium",
    status: "pending",
    created_at: "2026-03-05T12:00:00Z",
  },
];

const typeConfig: Record<SuggestionType, { icon: React.ReactNode; label: string; color: string }> = {
  content: { icon: <FileText className="h-4 w-4" />, label: "Content Gap", color: "text-blue-400 bg-blue-500/10" },
  optimization: { icon: <TrendingUp className="h-4 w-4" />, label: "Optimization", color: "text-green-400 bg-green-500/10" },
  competitive: { icon: <Swords className="h-4 w-4" />, label: "Competitive Alert", color: "text-orange-400 bg-orange-500/10" },
  monitoring: { icon: <Brain className="h-4 w-4" />, label: "Monitoring", color: "text-purple-400 bg-purple-500/10" },
};

const impactColor: Record<string, string> = {
  high: "text-red-400",
  medium: "text-yellow-400",
  low: "text-green-400",
};

const effortColor: Record<string, string> = {
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-red-400",
};

const AGENT_STATS = [
  { label: "Suggestions Generated", value: "47", sub: "last 30 days", icon: <Lightbulb className="h-4 w-4" /> },
  { label: "Actions Completed", value: "12", sub: "↑ 3 this week", icon: <CheckCircle2 className="h-4 w-4" /> },
  { label: "Avg. Score Improvement", value: "+8.3", sub: "points per action", icon: <TrendingUp className="h-4 w-4" /> },
  { label: "Competitor Alerts", value: "5", sub: "active this week", icon: <AlertTriangle className="h-4 w-4" /> },
];

export default function AgentPage() {
  const [suggestions, setSuggestions] = useState(DEMO_SUGGESTIONS);
  const [isRunning, setIsRunning] = useState(false);
  const [filter, setFilter] = useState<"all" | SuggestionType>("all");
  const [expandedId, setExpandedId] = useState<string | null>("1");
  const [agentEnabled, setAgentEnabled] = useState(true);

  const filtered = suggestions.filter((s) => filter === "all" || s.type === filter);
  const pending = suggestions.filter((s) => s.status === "pending").length;

  function handleRunAgent() {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      toast.success("Agent scan complete — 3 new suggestions generated!");
    }, 3000);
  }

  function markComplete(id: string) {
    setSuggestions((prev) => prev.map((s) => s.id === id ? { ...s, status: "completed" } : s));
    toast.success("Marked as complete!");
  }

  function startWork(id: string) {
    setSuggestions((prev) => prev.map((s) => s.id === id ? { ...s, status: "in_progress" } : s));
    toast.success("Marked as in progress");
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            AI Optimization Agent
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Continuous AI monitoring and content gap detection — automatically</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Agent</span>
            <button
              onClick={() => { setAgentEnabled(!agentEnabled); toast.success(agentEnabled ? "Agent paused" : "Agent resumed"); }}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors ${agentEnabled ? "bg-green-500" : "bg-muted"}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${agentEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
            <span className={`text-xs ${agentEnabled ? "text-green-400" : "text-muted-foreground"}`}>
              {agentEnabled ? "Active" : "Paused"}
            </span>
          </div>
          <button
            onClick={handleRunAgent}
            disabled={isRunning}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {isRunning ? "Scanning..." : "Run Scan Now"}
          </button>
        </div>
      </div>

      {/* Agent status banner */}
      {agentEnabled && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 px-5 py-3 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <p className="text-sm text-green-400 font-medium">Agent is active</p>
          <p className="text-sm text-muted-foreground">— Scanning AI answers daily at 9am · Monitoring 5 competitor brands · Tracking 23 prompts across 6 LLMs</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {AGENT_STATS.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">{stat.icon}</div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { id: "all", label: "All Suggestions" },
          { id: "content", label: "Content Gaps" },
          { id: "optimization", label: "Optimization" },
          { id: "competitive", label: "Competitive" },
          { id: "monitoring", label: "Monitoring" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
            }`}
          >
            {f.label}
            {f.id === "all" && pending > 0 && (
              <span className="ml-1.5 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">{pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* Suggestions list */}
      <div className="space-y-3">
        {filtered.map((suggestion) => {
          const config = typeConfig[suggestion.type];
          const isExpanded = expandedId === suggestion.id;
          return (
            <div
              key={suggestion.id}
              className={`rounded-xl border bg-card transition-colors ${
                suggestion.status === "completed" ? "border-border opacity-60" : "border-border hover:border-primary/30"
              }`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : suggestion.id)}
                className="w-full flex items-start gap-3 px-5 py-4 text-left"
              >
                <div className={`mt-0.5 rounded-lg p-1.5 flex-shrink-0 ${config.color}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${config.color}`}>{config.label}</span>
                    <span className={`text-xs font-medium ${impactColor[suggestion.impact]}`}>
                      {suggestion.impact} impact
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className={`text-xs ${effortColor[suggestion.effort]}`}>
                      {suggestion.effort} effort
                    </span>
                    {suggestion.status === "completed" && <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />}
                    {suggestion.status === "in_progress" && <Clock className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />}
                  </div>
                  <p className="font-medium text-sm">{suggestion.title}</p>
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform mt-1 ${isExpanded ? "rotate-90" : ""}`} />
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-border mt-0 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed pt-4">{suggestion.description}</p>
                  {suggestion.status !== "completed" && (
                    <div className="flex items-center gap-2">
                      {suggestion.status === "pending" && (
                        <>
                          <button
                            onClick={() => startWork(suggestion.id)}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1"
                          >
                            <Play className="h-3 w-3" /> Start Working
                          </button>
                          <button
                            onClick={() => toast.success("Generating content...")}
                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground flex items-center gap-1"
                          >
                            <Sparkles className="h-3 w-3" /> Auto-Generate Content
                          </button>
                        </>
                      )}
                      {suggestion.status === "in_progress" && (
                        <button
                          onClick={() => markComplete(suggestion.id)}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Mark Complete
                        </button>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(suggestion.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
