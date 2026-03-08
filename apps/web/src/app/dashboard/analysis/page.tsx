"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Play,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { analysisApi } from "@/lib/api";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { ScoreBar } from "@/components/dashboard/ScoreBar";
import { AnalysisReport } from "@/types";

const SCORE_DIMENSIONS = [
  { key: "entity_clarity", label: "Entity Clarity", description: "How clearly your product entity is defined" },
  { key: "category_ownership", label: "Category Ownership", description: "Strength of category association" },
  { key: "educational_authority", label: "Educational Authority", description: "Educational content depth and quality" },
  { key: "prompt_coverage", label: "Prompt Coverage", description: "% of AI prompts your content answers" },
  { key: "comparison_coverage", label: "Comparison Coverage", description: "vs/comparison content present" },
  { key: "ecosystem_coverage", label: "Ecosystem Coverage", description: "Coverage of related topics" },
  { key: "external_authority", label: "External Authority", description: "Third-party mentions and citations" },
  { key: "community_signal", label: "Community Signal", description: "Reddit, HN, Discord mentions" },
  { key: "consistency", label: "Content Consistency", description: "Messaging consistency across content" },
  { key: "structure_quality", label: "Structure Quality", description: "Headings, FAQs, definitions" },
];

// Mock data for demo
const DEMO_REPORT: Partial<AnalysisReport> = {
  status: "completed",
  overall_score: 42,
  findings: {},
  recommendations: [
    { action: 'Add a clear entity definition: "Product X is a [category] platform that [value prop]"', impact: 9 },
    { action: "Create educational article: What is AI Observability? Complete Guide", impact: 9 },
    { action: "Create Best AI Observability Tools comparison list", impact: 8 },
    { action: "Add FAQ section to all major product pages", impact: 7 },
    { action: "Publish Product X vs Competitor A comparison article", impact: 8 },
    { action: "Cover 15 ecosystem topics missing from your content", impact: 7 },
  ],
  content_gaps: [
    { topic: "LLM evaluation frameworks", importance: 9, suggested_title: "Complete Guide to LLM Evaluation", suggested_format: "guide" },
    { topic: "AI debugging techniques", importance: 8, suggested_title: "How to Debug AI Applications", suggested_format: "guide" },
    { topic: "Model drift detection", importance: 7, suggested_title: "What is Model Drift?", suggested_format: "blog" },
    { topic: "Prompt injection security", importance: 8, suggested_title: "AI Security: Prompt Injection Guide", suggested_format: "guide" },
    { topic: "AI cost optimization", importance: 7, suggested_title: "Reducing LLM API Costs", suggested_format: "blog" },
  ],
  content_roadmap: [
    { priority: 1, title: "What is AI Observability? Complete Guide", type: "guide", target_prompts: ["what is ai observability", "ai observability explained"], expected_impact: "Major improvement in prompt coverage and educational authority", score_impact: { metric: "educational_authority", estimated_gain: 12 }, outline: ["Introduction", "Core concepts", "Why it matters", "How it works", "Tools", "FAQ"] },
    { priority: 2, title: "Best AI Observability Tools 2026", type: "comparison", target_prompts: ["best ai observability tools", "top llm monitoring platforms"], expected_impact: "Appears in 'best tools' AI answers", score_impact: { metric: "comparison_coverage", estimated_gain: 18 }, outline: ["Overview", "Top tools", "Comparison table", "How to choose", "FAQ"] },
    { priority: 3, title: "AI Observability vs Traditional Monitoring", type: "comparison", target_prompts: ["ai observability vs monitoring", "llm monitoring differences"], expected_impact: "Covers comparison prompts", score_impact: { metric: "ecosystem_coverage", estimated_gain: 8 }, outline: ["Key differences", "When to use each", "Feature comparison", "Migration guide"] },
  ],
};

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState<"score" | "recommendations" | "gaps" | "roadmap">("score");

  const runMutation = useMutation({
    mutationFn: () => analysisApi.run("demo-project-id"),
    onSuccess: () => toast.success("Analysis started!"),
    onError: () => toast.error("Failed to start analysis"),
  });

  const report = DEMO_REPORT;
  const scores: Record<string, number> = {
    overall: 42,
    entity_clarity: 65,
    category_ownership: 52,
    educational_authority: 45,
    prompt_coverage: 28,
    comparison_coverage: 15,
    ecosystem_coverage: 38,
    external_authority: 30,
    community_signal: 20,
    consistency: 72,
    structure_quality: 58,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Visibility Analysis</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Comprehensive analysis of your AI discoverability signals
          </p>
        </div>
        <button
          onClick={() => runMutation.mutate()}
          disabled={runMutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {runMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Re-analyze
        </button>
      </div>

      {/* Score overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center">
          <ScoreRing score={scores.overall} size={200} />
          <div className="mt-4 w-full space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Industry Average</span>
              <span className="font-medium text-foreground">51 / 100</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Top Performers</span>
              <span className="font-medium text-green-400">78 / 100</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Your Score</span>
              <span className="font-medium text-orange-400">42 / 100</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">All Dimensions</h2>
          <div className="space-y-3">
            {SCORE_DIMENSIONS.map((dim) => (
              <ScoreBar
                key={dim.key}
                label={dim.label}
                score={scores[dim.key] || 0}
                description={dim.description}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
        {[
          { id: "score", label: "Score Details" },
          { id: "recommendations", label: "Recommendations" },
          { id: "gaps", label: "Content Gaps" },
          { id: "roadmap", label: "Content Roadmap" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "recommendations" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Top recommendations sorted by impact. Address these to improve your AI Visibility Score.
          </p>
          {report.recommendations?.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                rec.impact >= 8 ? "bg-red-500/20 text-red-400" :
                rec.impact >= 6 ? "bg-orange-500/20 text-orange-400" :
                "bg-yellow-500/20 text-yellow-400"
              }`}>
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{rec.action}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                <span className="text-xs font-medium text-green-400">+{rec.impact} impact</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "gaps" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            High-importance topics not covered by your content. These are opportunities competitors may exploit.
          </p>
          {report.content_gaps?.map((gap, i) => (
            <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                  <p className="font-medium text-sm">{gap.topic}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    gap.suggested_format === "guide" ? "bg-blue-500/15 text-blue-400" :
                    gap.suggested_format === "comparison" ? "bg-orange-500/15 text-orange-400" :
                    "bg-green-500/15 text-green-400"
                  }`}>
                    {gap.suggested_format}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Suggested: <span className="text-foreground">{gap.suggested_title}</span>
                </p>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: `${gap.importance * 10}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{gap.importance}/10</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "roadmap" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your prioritized 90-day content roadmap to improve AI visibility.
          </p>
          {report.content_roadmap?.map((item) => (
            <div key={item.priority} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                  {item.priority}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      item.type === "guide" ? "bg-blue-500/15 text-blue-400" :
                      item.type === "comparison" ? "bg-orange-500/15 text-orange-400" :
                      item.type === "faq" ? "bg-green-500/15 text-green-400" :
                      "bg-purple-500/15 text-purple-400"
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.expected_impact}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.target_prompts.map((p, i) => (
                      <span key={i} className="text-xs bg-muted rounded px-2 py-0.5 text-muted-foreground">
                        {p}
                      </span>
                    ))}
                  </div>
                  {item.outline && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1.5">Article outline:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.outline.map((section, i) => (
                          <span key={i} className="text-xs flex items-center gap-0.5 text-muted-foreground">
                            {i > 0 && <ChevronRight className="h-3 w-3" />}
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
