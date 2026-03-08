"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Play,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { simulationApi } from "@/lib/api";
import { SimulationResult } from "@/types";

const AVAILABLE_MODELS = [
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "Anthropic" },
  { id: "claude-opus-4-6", name: "Claude Opus 4.6", provider: "Anthropic" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "Google" },
];

export default function SimulationPage() {
  const [prompts, setPrompts] = useState([
    "What are the best AI observability tools?",
    "How do you monitor LLM applications?",
    "What tools help debug AI agents?",
  ]);
  const [newPrompt, setNewPrompt] = useState("");
  const [selectedModels, setSelectedModels] = useState([
    "claude-sonnet-4-6",
    "gpt-4o",
    "gemini-1.5-pro",
  ]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  // Poll for job status
  const { data: jobData } = useQuery({
    queryKey: ["simulation-job", activeJobId],
    queryFn: () => simulationApi.getJob(activeJobId!).then((r) => r.data),
    enabled: !!activeJobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "completed" || status === "failed" ? false : 2000;
    },
  });

  const { data: results } = useQuery({
    queryKey: ["simulation-results", activeJobId],
    queryFn: () => simulationApi.getResults(activeJobId!).then((r) => r.data),
    enabled: !!activeJobId && jobData?.status === "completed",
  });

  const runMutation = useMutation({
    mutationFn: () =>
      simulationApi.run({
        project_id: "demo-project-id", // Replace with real project ID
        prompts,
        target_models: selectedModels,
      }),
    onSuccess: ({ data }) => {
      setActiveJobId(data.job_id);
      toast.success("Simulation started!");
    },
    onError: () => toast.error("Failed to start simulation"),
  });

  function addPrompt() {
    if (newPrompt.trim() && !prompts.includes(newPrompt.trim())) {
      setPrompts([...prompts, newPrompt.trim()]);
      setNewPrompt("");
    }
  }

  function toggleModel(modelId: string) {
    setSelectedModels((prev) =>
      prev.includes(modelId) ? prev.filter((m) => m !== modelId) : [...prev, modelId]
    );
  }

  const summary = jobData?.summary;
  const isRunning = jobData?.status === "running" || jobData?.status === "pending";

  // Group results by prompt
  const resultsByPrompt = results?.reduce((acc: Record<string, SimulationResult[]>, r: SimulationResult) => {
    if (!acc[r.prompt]) acc[r.prompt] = [];
    acc[r.prompt].push(r);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">LLM Simulation Engine</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Test how your product appears in responses from real AI models
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Config panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Prompts */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-3">Test Prompts</h2>
            <div className="space-y-2 mb-3">
              {prompts.map((prompt, i) => (
                <div key={i} className="flex items-start gap-2 group">
                  <div className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    {prompt}
                  </div>
                  <button
                    onClick={() => setPrompts(prompts.filter((_, pi) => pi !== i))}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all mt-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPrompt()}
                placeholder="Add a prompt..."
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                onClick={addPrompt}
                className="rounded-lg border border-border px-3 py-2 hover:bg-accent transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Model selection */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-3">Target Models</h2>
            <div className="space-y-2">
              {AVAILABLE_MODELS.map((model) => {
                const selected = selectedModels.includes(model.id);
                return (
                  <button
                    key={model.id}
                    onClick={() => toggleModel(model.id)}
                    className={`w-full flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                      selected
                        ? "border-primary/50 bg-primary/10"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        selected ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}
                    >
                      {selected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                    </div>
                    <div>
                      <span className="font-medium">{model.name}</span>
                      <span className="text-muted-foreground ml-1.5 text-xs">{model.provider}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Run button */}
          <button
            onClick={() => runMutation.mutate()}
            disabled={runMutation.isPending || isRunning || prompts.length === 0 || selectedModels.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running simulation...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Simulation ({prompts.length} prompts × {selectedModels.length} models)
              </>
            )}
          </button>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Summary */}
          {summary && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold mb-4">Simulation Summary</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {[
                  { label: "Mention Rate", value: `${summary.mention_rate?.toFixed(1)}%`, good: summary.mention_rate > 30 },
                  { label: "Avg Rank Position", value: summary.avg_rank ? `#${summary.avg_rank?.toFixed(1)}` : "N/A", good: summary.avg_rank && summary.avg_rank <= 3 },
                  { label: "Tests Run", value: summary.total_tests },
                  { label: "Mentions", value: summary.mention_count },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className={`text-2xl font-bold ${stat.good ? "text-green-400" : "text-red-400"}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Competitor share of voice */}
              {Object.keys(summary.competitor_share_of_voice || {}).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">LLM Share of Voice</p>
                  <div className="space-y-1.5">
                    {[
                      { name: "Your Product", sov: summary.product_share_of_voice, isYou: true },
                      ...Object.entries(summary.competitor_share_of_voice).map(([name, sov]) => ({
                        name,
                        sov: sov as number,
                        isYou: false,
                      })),
                    ]
                      .sort((a, b) => b.sov - a.sov)
                      .map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <span className={`text-xs w-32 truncate ${item.isYou ? "text-primary font-medium" : "text-muted-foreground"}`}>
                            {item.name}
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${item.isYou ? "bg-primary" : "bg-muted-foreground/40"}`}
                              style={{ width: `${Math.min(item.sov, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-10 text-right">
                            {item.sov.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detailed results by prompt */}
          {resultsByPrompt && Object.keys(resultsByPrompt).length > 0 && (
            <div className="space-y-3">
              {Object.entries(resultsByPrompt).map(([prompt, promptResults]) => {
                const isExpanded = expandedPrompt === prompt;
                const mentionCount = promptResults.filter((r) => r.product_mentioned).length;

                return (
                  <div key={prompt} className="rounded-xl border border-border bg-card overflow-hidden">
                    <button
                      onClick={() => setExpandedPrompt(isExpanded ? null : prompt)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{prompt}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Mentioned in {mentionCount}/{promptResults.length} model responses
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          mentionCount > 0 ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                        }`}>
                          {mentionCount > 0 ? `Rank #${Math.min(...promptResults.filter(r => r.mention_rank).map(r => r.mention_rank!))}` : "Not mentioned"}
                        </span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border divide-y divide-border">
                        {promptResults.map((result) => (
                          <div key={result.id} className="p-4">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium bg-secondary rounded px-2 py-0.5">
                                  {result.llm_model}
                                </span>
                                {result.product_mentioned ? (
                                  <span className="text-xs text-green-400 flex items-center gap-0.5">
                                    <Check className="h-3 w-3" />
                                    Mentioned {result.mention_rank ? `(#${result.mention_rank})` : ""}
                                  </span>
                                ) : (
                                  <span className="text-xs text-red-400 flex items-center gap-0.5">
                                    <X className="h-3 w-3" />
                                    Not mentioned
                                  </span>
                                )}
                              </div>
                              {result.latency_ms && (
                                <span className="text-xs text-muted-foreground">{result.latency_ms}ms</span>
                              )}
                            </div>
                            {result.mention_context && (
                              <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2 italic">
                                &ldquo;{result.mention_context}&rdquo;
                              </p>
                            )}
                            {result.competitors_mentioned.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Also mentioned: {result.competitors_mentioned.join(", ")}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!activeJobId && !isRunning && (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <Brain className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Configure your prompts and models, then run a simulation to see how AI systems respond to your brand.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
