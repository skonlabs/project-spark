import { useState } from "react";
import {
  Search,
  Sparkles,
  TrendingUp,
  HelpCircle,
  Swords,
  BookOpen,
  Hash,
  Plus,
  Play,
  ChevronRight,
  BarChart2,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

type ClusterType = "what-is" | "best-tools" | "how-to" | "vs" | "alternatives" | "custom";

interface PromptCluster {
  id: string;
  type: ClusterType;
  label: string;
  icon: React.ReactNode;
  color: string;
  prompts: { text: string; searchVolume: string; difficulty: "low" | "medium" | "high"; covered: boolean }[];
}

const DEMO_CLUSTERS: PromptCluster[] = [
  {
    id: "what-is",
    type: "what-is",
    label: "What is X",
    icon: <HelpCircle className="h-4 w-4" />,
    color: "text-blue-400",
    prompts: [
      { text: "What is AI observability?", searchVolume: "High", difficulty: "medium", covered: true },
      { text: "What is LLM monitoring?", searchVolume: "High", difficulty: "low", covered: true },
      { text: "What is an AI observability platform?", searchVolume: "Medium", difficulty: "low", covered: false },
      { text: "What is prompt tracing?", searchVolume: "Medium", difficulty: "low", covered: false },
      { text: "What is model drift detection?", searchVolume: "Low", difficulty: "medium", covered: false },
    ],
  },
  {
    id: "best-tools",
    type: "best-tools",
    label: "Best X Tools",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "text-green-400",
    prompts: [
      { text: "Best AI observability tools 2026", searchVolume: "Very High", difficulty: "high", covered: false },
      { text: "Best LLM monitoring platforms", searchVolume: "High", difficulty: "high", covered: false },
      { text: "Top AI debugging tools", searchVolume: "Medium", difficulty: "medium", covered: false },
      { text: "Best prompt analytics tools", searchVolume: "Medium", difficulty: "medium", covered: true },
      { text: "Best MLOps observability solutions", searchVolume: "Low", difficulty: "low", covered: false },
    ],
  },
  {
    id: "how-to",
    type: "how-to",
    label: "How to Solve X",
    icon: <BookOpen className="h-4 w-4" />,
    color: "text-yellow-400",
    prompts: [
      { text: "How to monitor LLM applications in production?", searchVolume: "High", difficulty: "medium", covered: false },
      { text: "How to debug AI agents?", searchVolume: "High", difficulty: "medium", covered: false },
      { text: "How to reduce LLM hallucinations?", searchVolume: "Very High", difficulty: "high", covered: false },
      { text: "How to track AI costs?", searchVolume: "Medium", difficulty: "low", covered: true },
      { text: "How to evaluate LLM output quality?", searchVolume: "Medium", difficulty: "medium", covered: false },
    ],
  },
  {
    id: "vs",
    type: "vs",
    label: "X vs Y",
    icon: <Swords className="h-4 w-4" />,
    color: "text-orange-400",
    prompts: [
      { text: "GAEO Platform vs LangSmith", searchVolume: "Medium", difficulty: "low", covered: false },
      { text: "AI observability vs traditional monitoring", searchVolume: "Medium", difficulty: "medium", covered: false },
      { text: "LLM monitoring vs APM tools", searchVolume: "Low", difficulty: "low", covered: false },
      { text: "Helicone vs Arize AI", searchVolume: "Low", difficulty: "low", covered: false },
    ],
  },
  {
    id: "alternatives",
    type: "alternatives",
    label: "Alternatives",
    icon: <Hash className="h-4 w-4" />,
    color: "text-purple-400",
    prompts: [
      { text: "LangSmith alternatives", searchVolume: "High", difficulty: "medium", covered: false },
      { text: "Arize AI alternatives", searchVolume: "Medium", difficulty: "low", covered: false },
      { text: "Datadog alternatives for LLM monitoring", searchVolume: "Medium", difficulty: "medium", covered: false },
      { text: "Open source LLM observability tools", searchVolume: "Medium", difficulty: "medium", covered: false },
    ],
  },
];

const difficultyColor: Record<string, string> = {
  low: "text-green-400 bg-green-500/10",
  medium: "text-yellow-400 bg-yellow-500/10",
  high: "text-red-400 bg-red-500/10",
};

export default function PromptsPage() {
  const [selectedCluster, setSelectedCluster] = useState<string | null>("what-is");
  const [product, setProduct] = useState("GAEO Platform");
  const [category, setCategory] = useState("AI observability");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [tab, setTab] = useState<"clusters" | "simulate">("clusters");

  const activeCluster = DEMO_CLUSTERS.find((c) => c.id === selectedCluster);
  const totalPrompts = DEMO_CLUSTERS.reduce((a, c) => a + c.prompts.length, 0);
  const coveredPrompts = DEMO_CLUSTERS.reduce((a, c) => a + c.prompts.filter((p) => p.covered).length, 0);

  function handleDiscover() {
    setIsDiscovering(true);
    setTimeout(() => {
      setIsDiscovering(false);
      toast.success("Prompt discovery complete — 24 new prompts found!");
    }, 2500);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Discovery Prompt Engine</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Identify real prompts users ask AI systems — then rank for them</p>
        </div>
        <button
          onClick={handleDiscover}
          disabled={isDiscovering}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {isDiscovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isDiscovering ? "Discovering..." : "Discover Prompts"}
        </button>
      </div>

      {/* Config */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-3">Product Configuration</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Product / Brand Name</label>
            <input
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Product Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{totalPrompts}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Prompts</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{coveredPrompts}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Content Covered</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{totalPrompts - coveredPrompts}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Content Gaps</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
        <button onClick={() => setTab("clusters")} className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === "clusters" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          Prompt Clusters
        </button>
        <button onClick={() => setTab("simulate")} className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === "simulate" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          Quick Simulate
        </button>
      </div>

      {tab === "clusters" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cluster list */}
          <div className="space-y-2">
            {DEMO_CLUSTERS.map((cluster) => {
              const covered = cluster.prompts.filter((p) => p.covered).length;
              return (
                <button
                  key={cluster.id}
                  onClick={() => setSelectedCluster(cluster.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                    selectedCluster === cluster.id ? "border-primary/50 bg-primary/10" : "border-border hover:border-primary/30 bg-card"
                  }`}
                >
                  <div className={cluster.color}>{cluster.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{cluster.label}</p>
                    <p className="text-xs text-muted-foreground">{cluster.prompts.length} prompts · {covered} covered</p>
                  </div>
                  <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full"
                      style={{ width: `${(covered / cluster.prompts.length) * 100}%` }}
                    />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Prompt list */}
          {activeCluster && (
            <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <div className={activeCluster.color}>{activeCluster.icon}</div>
                <h2 className="font-semibold">{activeCluster.label} Prompts</h2>
                <span className="ml-auto text-xs text-muted-foreground">{activeCluster.prompts.length} prompts</span>
              </div>
              <div className="divide-y divide-border">
                {activeCluster.prompts.map((prompt, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{prompt.text}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">Volume: {prompt.searchVolume}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${difficultyColor[prompt.difficulty]}`}>
                          {prompt.difficulty} competition
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {prompt.covered ? (
                        <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full">Covered</span>
                      ) : (
                        <span className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">Gap</span>
                      )}
                      <button
                        onClick={() => toast.success("Added to simulation queue")}
                        className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Run in simulation"
                      >
                        <Play className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-border flex items-center gap-2">
                <input
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Add custom prompt..."
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  onClick={() => { toast.success("Prompt added"); setCustomPrompt(""); }}
                  disabled={!customPrompt.trim()}
                  className="rounded-lg border border-border px-3 py-2 hover:bg-accent disabled:opacity-60 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "simulate" && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Quick Prompt Simulation</h2>
          <p className="text-sm text-muted-foreground">Test a specific prompt across all major LLMs to see how your product ranks.</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="What are the best AI observability tools?"
                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <button
              onClick={() => { toast.success("Simulation queued — check LLM Simulation page"); setCustomPrompt(""); }}
              disabled={!customPrompt.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2"
            >
              <BarChart2 className="h-4 w-4" /> Simulate
            </button>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Suggested prompts:</p>
            {[
              "Best AI observability tools 2026",
              "How to monitor LLM applications?",
              "AI observability vs traditional monitoring",
              "LangSmith alternatives",
            ].map((p) => (
              <button
                key={p}
                onClick={() => setCustomPrompt(p)}
                className="w-full text-left text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Search className="h-3 w-3 flex-shrink-0" /> {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
