"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight, ArrowUpRight, BarChart3, Brain, FileText,
  Loader2, Monitor, Plus, Swords, TrendingUp, Zap,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { analysisApi, ingestApi, monitoringApi } from "@/lib/api";
import { useProjectStore } from "@/lib/stores/project-store";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { ScoreBar } from "@/components/dashboard/ScoreBar";

const SCORE_DIMENSIONS = [
  { key: "entityClarityScore", label: "Entity Clarity", description: "How clearly your product entity is defined" },
  { key: "promptCoverageScore", label: "Prompt Coverage", description: "% of AI prompts your content answers" },
  { key: "educationalScore", label: "Educational Authority", description: "Educational content depth and quality" },
  { key: "categoryOwnershipScore", label: "Category Ownership", description: "Strength of category association" },
  { key: "comparisonScore", label: "Comparison Coverage", description: "vs/comparison content present" },
  { key: "ecosystemScore", label: "Ecosystem Coverage", description: "Coverage of related topics" },
  { key: "externalAuthorityScore", label: "External Authority", description: "Third-party mentions and citations" },
  { key: "consistencyScore", label: "Content Consistency", description: "Messaging consistency across content" },
];

export default function DashboardPage() {
  const { activeProject } = useProjectStore();
  const projectId = activeProject?.id;

  const { data: scoreData } = useQuery({
    queryKey: ["score", projectId],
    queryFn: () => analysisApi.getScore(projectId!).then((r) => r.data),
    enabled: !!projectId,
  });

  const { data: reportsData } = useQuery({
    queryKey: ["reports", projectId],
    queryFn: () => analysisApi.listReports(projectId!, 3).then((r) => r.data),
    enabled: !!projectId,
  });

  const { data: assetsData } = useQuery({
    queryKey: ["assets", projectId],
    queryFn: () => ingestApi.listAssets(projectId!).then((r) => r.data),
    enabled: !!projectId,
  });

  const { data: alertsData } = useQuery({
    queryKey: ["alerts", projectId],
    queryFn: () => monitoringApi.getAlerts(projectId!, true).then((r) => r.data),
    enabled: !!projectId,
    refetchInterval: 60_000,
  });

  const qc = useQueryClient();
  const runMutation = useMutation({
    mutationFn: () => analysisApi.run(projectId!),
    onSuccess: () => {
      toast.success("Analysis started — results in ~30 seconds");
      setTimeout(() => qc.invalidateQueries({ queryKey: ["score", projectId] }), 35_000);
    },
    onError: () => toast.error("Failed to start analysis"),
  });

  const score = scoreData?.report?.overallScore ?? activeProject?.visibility_score ?? null;
  const breakdown = scoreData?.report ?? {};
  const latestReport = reportsData?.reports?.[0];
  const roadmap = latestReport?.contentRoadmap ?? [];
  const assetCount = assetsData?.assets?.length ?? 0;
  const alertCount = alertsData?.alerts?.length ?? 0;

  if (!activeProject) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Brain className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold mb-2">No project selected</h2>
        <p className="text-muted-foreground mb-4">Create a project to start tracking your AI visibility.</p>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> New Project
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Visibility Overview</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {activeProject.productName} — AI Engine Optimization command center
          </p>
        </div>
        <button
          onClick={() => runMutation.mutate()}
          disabled={runMutation.isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {runMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          Run Analysis
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "AI Visibility Score",
            value: score !== null ? String(Math.round(score)) : "—",
            suffix: score !== null ? "/100" : "",
            change: score !== null ? `Last analyzed` : "Run analysis to get score",
            positive: score !== null && score >= 50,
            icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10",
          },
          {
            label: "Content Assets",
            value: String(assetCount),
            suffix: " docs",
            change: assetCount > 0 ? "Ingested" : "No content yet",
            positive: assetCount > 0,
            icon: FileText, color: "text-green-400", bg: "bg-green-500/10",
          },
          {
            label: "Monitoring Alerts",
            value: String(alertCount),
            suffix: alertCount === 1 ? " new" : " new",
            change: alertCount > 0 ? "Needs attention" : "All clear",
            positive: alertCount === 0,
            icon: Monitor, color: "text-red-400", bg: "bg-red-500/10",
          },
          {
            label: "Analyses Run",
            value: String(reportsData?.reports?.length ?? 0),
            suffix: " total",
            change: latestReport ? `Last: ${new Date(latestReport.createdAt || latestReport.created_at).toLocaleDateString()}` : "None yet",
            positive: true,
            icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10",
          },
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
              <p className={`text-xs mt-1 font-medium ${stat.positive ? "text-green-400" : "text-red-400"}`}>
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Score + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center">
          <h2 className="font-semibold mb-4">AI Visibility Score</h2>
          <ScoreRing score={score ?? 0} size={180} />
          {score === null && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Run an analysis to calculate your AI visibility score.
            </p>
          )}
          <Link
            href="/dashboard/analysis"
            className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View full analysis <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">Score Breakdown</h2>
          {score !== null ? (
            <div className="space-y-3">
              {SCORE_DIMENSIONS.map((dim) => (
                <ScoreBar
                  key={dim.key}
                  label={dim.label}
                  score={(breakdown as Record<string, number>)[dim.key] ?? 0}
                  description={dim.description}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No analysis data yet — click &ldquo;Run Analysis&rdquo; above.
            </div>
          )}
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
            <Link key={action.title} href={action.href} className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all group">
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

      {/* Content roadmap preview */}
      {roadmap.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Content Roadmap
            </h2>
            <Link href="/dashboard/analysis" className="text-sm text-primary hover:underline">
              View full roadmap
            </Link>
          </div>
          <div className="space-y-3">
            {roadmap.slice(0, 4).map((item: Record<string, unknown>, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                  {item.priority as number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.title as string}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {((item.targetPrompts as string[]) || []).slice(0, 2).join(", ")}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  item.type === "article" ? "bg-blue-500/15 text-blue-400" :
                  item.type === "comparison" ? "bg-orange-500/15 text-orange-400" :
                  "bg-green-500/15 text-green-400"
                }`}>
                  {item.type as string}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
