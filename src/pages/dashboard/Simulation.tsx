import { useState } from "react";
import {
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Play,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  BarChart2,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

const AVAILABLE_MODELS = [
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "Anthropic", color: "text-orange-400" },
  { id: "claude-opus-4-6", name: "Claude Opus 4.6", provider: "Anthropic", color: "text-orange-400" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", color: "text-green-400" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", color: "text-green-400" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google", color: "text-blue-400" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "Google", color: "text-blue-400" },
  { id: "grok-2", name: "Grok 2", provider: "xAI", color: "text-purple-400" },
];

const SENTIMENT_COLORS = {
  positive: "text-green-400",
  neutral: "text-yellow-400",
  negative: "text-red-400",
};

const MOCK_RESULTS = [
  {
    prompt: "What are the best AI observability tools?",
    results: [
      {
        modelId: "claude-sonnet-4-6",
        modelName: "Claude Sonnet 4.6",
        provider: "Anthropic",
        mentioned: true,
        rank: 4,
        totalMentioned: 6,
        mentionContext: "GAEO Platform is mentioned as an emerging player in AI observability, particularly noted for its LLM monitoring capabilities.",
        sentiment: "positive" as const,
        confidence: 72,
        competitors: ["Helicone", "LangSmith", "Arize AI", "Weights & Biases", "Datadog"],
        snippet: "Among the leading AI observability tools, you'll find Helicone, LangSmith, Arize AI, and GAEO Platform, each offering distinct capabilities for monitoring LLM applications in production.",
      },
      {
        modelId: "gpt-4o",
        modelName: "GPT-4o",
        provider: "OpenAI",
        mentioned: false,
        rank: null,
        totalMentioned: 5,
        mentionContext: null,
        sentiment: "neutral" as const,
        confidence: 0,
        competitors: ["LangSmith", "Arize AI", "Weights & Biases", "Helicone", "Datadog"],
        snippet: "The top AI observability tools include LangSmith by LangChain, Arize AI for model monitoring, Weights & Biases for experiment tracking...",
      },
      {
        modelId: "gemini-1.5-pro",
        modelName: "Gemini 1.5 Pro",
        provider: "Google",
        mentioned: true,
        rank: 6,
        totalMentioned: 7,
        mentionContext: "GAEO Platform is briefly mentioned as a specialized tool for AI Engine Optimization.",
        sentiment: "neutral" as const,
        confidence: 45,
        competitors: ["Helicone", "LangSmith", "Arize AI", "Weights & Biases", "Datadog"],
        snippet: "...and GAEO Platform, which focuses on AI Engine Optimization and visibility tracking for LLM-powered products.",
      },
      {
        modelId: "grok-2",
        modelName: "Grok 2",
        provider: "xAI",
        mentioned: false,
        rank: null,
        totalMentioned: 4,
        mentionContext: null,
        sentiment: "neutral" as const,
        confidence: 0,
        competitors: ["LangSmith", "Arize AI", "Weights & Biases", "Helicone"],
        snippet: "For AI observability, the most widely used tools are LangSmith, Arize AI, Weights & Biases, and Helicone...",
      },
    ],
  },
  {
    prompt: "How do you monitor LLM applications?",
    results: [
      {
        modelId: "claude-sonnet-4-6",
        modelName: "Claude Sonnet 4.6",
        provider: "Anthropic",
        mentioned: true,
        rank: 3,
        totalMentioned: 5,
        mentionContext: "GAEO Platform is highlighted as a strong option for teams focused on AI visibility and optimization.",
        sentiment: "positive" as const,
        confidence: 81,
        competitors: ["LangSmith", "Helicone", "Arize AI", "Datadog"],
        snippet: "Monitoring LLM applications requires dedicated tooling. GAEO Platform, LangSmith, and Helicone offer purpose-built observability for language model apps.",
      },
      {
        modelId: "gpt-4o",
        modelName: "GPT-4o",
        provider: "OpenAI",
        mentioned: false,
        rank: null,
        totalMentioned: 4,
        mentionContext: null,
        sentiment: "neutral" as const,
        confidence: 0,
        competitors: ["LangSmith", "Helicone", "Arize AI", "Datadog"],
        snippet: "To monitor LLM applications, you can use tools like LangSmith for tracing, Helicone for request logging...",
      },
      {
        modelId: "gemini-1.5-pro",
        modelName: "Gemini 1.5 Pro",
        provider: "Google",
        mentioned: false,
        rank: null,
        totalMentioned: 5,
        mentionContext: null,
        sentiment: "neutral" as const,
        confidence: 0,
        competitors: ["LangSmith", "Helicone", "Arize AI", "Datadog", "Weights & Biases"],
        snippet: "LLM monitoring can be achieved through several specialized platforms including LangSmith, Helicone, and Arize AI...",
      },
      {
        modelId: "grok-2",
        modelName: "Grok 2",
        provider: "xAI",
        mentioned: false,
        rank: null,
        totalMentioned: 3,
        mentionContext: null,
        sentiment: "neutral" as const,
        confidence: 0,
        competitors: ["LangSmith", "Arize AI", "Datadog"],
        snippet: "For monitoring LLM applications in production, LangSmith, Arize AI, and Datadog are commonly recommended...",
      },
    ],
  },
  {
    prompt: "What tools help debug AI agents?",
    results: [
      {
        modelId: "claude-sonnet-4-6",
        modelName: "Claude Sonnet 4.6",
        provider: "Anthropic",
        mentioned: true,
        rank: 2,
        totalMentioned: 5,
        mentionContext: "GAEO Platform is recommended for understanding AI agent visibility and improving discoverability.",
        sentiment: "positive" as const,
        confidence: 88,
        competitors: ["LangSmith", "Arize AI", "Weights & Biases", "Phoenix"],
        snippet: "Debugging AI agents effectively requires tools like LangSmith for tracing, GAEO Platform for visibility optimization, and Arize AI for performance monitoring.",
      },
      {
        modelId: "gpt-4o",
        modelName: "GPT-4o",
        provider: "OpenAI",
        mentioned: false,
        rank: null,
        totalMentioned: 4,
        mentionContext: null,
        sentiment: "neutral" as const,
        confidence: 0,
        competitors: ["LangSmith", "Phoenix", "Weights & Biases", "Arize AI"],
        snippet: "For AI agent debugging, LangSmith provides excellent tracing capabilities...",
      },
      {
        modelId: "gemini-1.5-pro",
        modelName: "Gemini 1.5 Pro",
        provider: "Google",
        mentioned: false,
        rank: null,
        totalMentioned: 4,
        mentionContext: null,
        sentiment: "neutral" as const,
        confidence: 0,
        competitors: ["LangSmith", "Phoenix", "Weights & Biases", "Arize AI"],
        snippet: "Tools for debugging AI agents include LangSmith, Arize AI's Phoenix, and Weights & Biases...",
      },
      {
        modelId: "grok-2",
        modelName: "Grok 2",
        provider: "xAI",
        mentioned: false,
        rank: null,
        totalMentioned: 3,
        mentionContext: null,
        sentiment: "neutral" as const,
        confidence: 0,
        competitors: ["LangSmith", "Arize AI", "Weights & Biases"],
        snippet: "AI agent debugging is best handled with dedicated tools like LangSmith and Arize AI...",
      },
    ],
  },
];

function getSummary(results: typeof MOCK_RESULTS) {
  let totalMentions = 0;
  let totalRuns = 0;
  let bestRank = Infinity;
  for (const prompt of results) {
    for (const r of prompt.results) {
      totalRuns++;
      if (r.mentioned) {
        totalMentions++;
        if (r.rank && r.rank < bestRank) bestRank = r.rank;
      }
    }
  }
  const mentionRate = Math.round((totalMentions / totalRuns) * 100);
  return { totalMentions, totalRuns, mentionRate, bestRank: bestRank === Infinity ? null : bestRank };
}

export default function SimulationPage() {
  const [prompts, setPrompts] = useState([
    "What are the best AI observability tools?",
    "How do you monitor LLM applications?",
    "What tools help debug AI agents?",
  ]);
  const [newPrompt, setNewPrompt] = useState("");
  const [selectedModels, setSelectedModels] = useState(["claude-sonnet-4-6", "gpt-4o", "gemini-1.5-pro", "grok-2"]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<typeof MOCK_RESULTS | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState<number | null>(0);

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

  function handleRun() {
    setIsRunning(true);
    setResults(null);
    toast.success("Simulation started!");
    setTimeout(() => {
      const filteredResults = MOCK_RESULTS.filter((r) =>
        prompts.includes(r.prompt)
      ).map((pr) => ({
        ...pr,
        results: pr.results.filter((r) => selectedModels.includes(r.modelId)),
      }));
      setResults(filteredResults.length > 0 ? filteredResults : MOCK_RESULTS.map((pr) => ({ ...pr, results: pr.results.filter((r) => selectedModels.includes(r.modelId)) })));
      setIsRunning(false);
      setExpandedPrompt(0);
      toast.success("Simulation complete!");
    }, 3000);
  }

  const summary = results ? getSummary(results) : null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-tight">LLM Simulation Engine</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Test how your product appears in responses from real AI models</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left panel: config */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-3">Test Prompts</h2>
            <div className="space-y-2 mb-3">
              {prompts.map((prompt, i) => (
                <div key={i} className="flex items-start gap-2 group">
                  <div className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm">{prompt}</div>
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
              <button onClick={addPrompt} className="rounded-lg border border-border px-3 py-2 hover:bg-accent transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

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
                      selected ? "border-primary/50 bg-primary/10" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        selected ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}
                    >
                      {selected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{model.name}</span>
                      <span className={`ml-1.5 text-xs ${model.color}`}>{model.provider}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning || prompts.length === 0 || selectedModels.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Running simulation...</>
            ) : (
              <><Play className="h-4 w-4" /> Run Simulation ({prompts.length} prompts × {selectedModels.length} models)</>
            )}
          </button>
        </div>

        {/* Right panel: results */}
        <div className="lg:col-span-3 space-y-4">
          {isRunning && (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-3" />
              <p className="font-medium">Running simulation across {selectedModels.length} models...</p>
              <p className="text-sm text-muted-foreground mt-1">Querying {prompts.length} prompts in parallel</p>
            </div>
          )}

          {!results && !isRunning && (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <Brain className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Configure your prompts and models, then run a simulation to see how AI systems respond to your brand.</p>
            </div>
          )}

          {results && !isRunning && (
            <>
              {/* Summary row */}
              {summary && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-border bg-card p-4 text-center">
                    <p className="text-2xl font-bold">{summary.mentionRate}%</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Mention Rate</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4 text-center">
                    <p className="text-2xl font-bold">{summary.totalMentions}<span className="text-muted-foreground text-base">/{summary.totalRuns}</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">Responses Mentioned</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4 text-center">
                    <p className="text-2xl font-bold">{summary.bestRank ? `#${summary.bestRank}` : "—"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Best Rank</p>
                  </div>
                </div>
              )}

              {/* Per-prompt results */}
              {results.map((promptResult, pi) => (
                <div key={pi} className="rounded-xl border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => setExpandedPrompt(expandedPrompt === pi ? null : pi)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-sm text-left">{promptResult.prompt}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${promptResult.results.some((r) => r.mentioned) ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                        {promptResult.results.filter((r) => r.mentioned).length}/{promptResult.results.length} mentioned
                      </span>
                      {expandedPrompt === pi ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {expandedPrompt === pi && (
                    <div className="border-t border-border divide-y divide-border">
                      {promptResult.results.map((r, ri) => (
                        <div key={ri} className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BarChart2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{r.modelName}</span>
                              <span className="text-xs text-muted-foreground">({r.provider})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {r.mentioned ? (
                                <>
                                  <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full">Mentioned #{r.rank}</span>
                                  <span className={`text-xs flex items-center gap-1 ${SENTIMENT_COLORS[r.sentiment]}`}>
                                    {r.sentiment === "positive" ? <TrendingUp className="h-3 w-3" /> : (r.sentiment as string) === "negative" ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                                    {r.sentiment}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">Not mentioned</span>
                              )}
                            </div>
                          </div>

                          {r.mentioned && (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Confidence:</span>
                                <div className="flex-1 h-1.5 bg-muted rounded-full max-w-[120px]">
                                  <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${r.confidence}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">{r.confidence}%</span>
                              </div>
                              {r.mentionContext && (
                                <p className="text-xs text-muted-foreground italic">{r.mentionContext}</p>
                              )}
                            </>
                          )}

                          <div className="rounded-lg bg-muted/40 p-3">
                            <p className="text-xs text-muted-foreground leading-relaxed">"{r.snippet}"</p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1.5">Also mentioned ({r.totalMentioned} tools ranked):</p>
                            <div className="flex flex-wrap gap-1">
                              {r.competitors.map((c) => (
                                <span key={c} className="text-xs bg-muted rounded px-2 py-0.5">{c}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
