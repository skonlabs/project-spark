import { useState } from "react";
import {
  Search,
  Sparkles,
  TrendingUp,
  HelpCircle,
  Swords,
  BookOpen,
  Hash,
  Wrench,
  Plus,
  Play,
  ChevronRight,
  BarChart2,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getProductPrompts,
  addPromptsToProduct,
  type LLMIntentType,
  type ProductPrompt,
} from "@/data/products";

// ─── Intent taxonomy ──────────────────────────────────────────────────────────

interface IntentMeta {
  id: LLMIntentType;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  example: string;
}

const INTENT_META: IntentMeta[] = [
  {
    id: "seek_explanation",
    label: "Explain / What is",
    desc: "User asks the AI to explain or define something",
    icon: <HelpCircle className="h-4 w-4" />,
    color: "text-blue-400",
    example: '"What is AI observability?"',
  },
  {
    id: "find_best",
    label: "Find the best",
    desc: "User asks for top tools, platforms, or recommendations",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "text-green-400",
    example: '"Best LLM monitoring tools 2026"',
  },
  {
    id: "compare",
    label: "Compare options",
    desc: "User compares two or more products side-by-side",
    icon: <Swords className="h-4 w-4" />,
    color: "text-orange-400",
    example: '"GAEO vs LangSmith"',
  },
  {
    id: "learn_howto",
    label: "Learn how-to",
    desc: "User wants step-by-step guidance or instructions",
    icon: <BookOpen className="h-4 w-4" />,
    color: "text-yellow-400",
    example: '"How to monitor LLM apps in production?"',
  },
  {
    id: "find_alternative",
    label: "Find alternatives",
    desc: "User is looking for alternatives to an existing tool",
    icon: <Hash className="h-4 w-4" />,
    color: "text-purple-400",
    example: '"LangSmith alternatives"',
  },
  {
    id: "troubleshoot",
    label: "Troubleshoot / Fix",
    desc: "User is diagnosing a problem or seeking a fix",
    icon: <Wrench className="h-4 w-4" />,
    color: "text-red-400",
    example: '"Why is my LLM giving wrong answers?"',
  },
];

const PRODUCT_ID = "product-gaeo";

const DISCOVERED_PROMPTS: Array<{ text: string; intent: LLMIntentType }> = [
  { text: "What tools help monitor LLM outputs in production?", intent: "find_best" },
  { text: "How do I track which prompts my users are sending to AI?", intent: "learn_howto" },
  { text: "Best AI observability platform for enterprise teams", intent: "find_best" },
  { text: "What is prompt drift and how do I detect it?", intent: "seek_explanation" },
  { text: "GAEO vs Arize AI — which is better for LLM monitoring?", intent: "compare" },
  { text: "Open-source alternatives to GAEO for AI observability", intent: "find_alternative" },
  { text: "Why are my LLM responses getting worse over time?", intent: "troubleshoot" },
  { text: "How to set up automated regression testing for LLMs", intent: "learn_howto" },
  { text: "What metrics should I track for production LLM apps?", intent: "seek_explanation" },
  { text: "Cheapest LLM observability tool with good dashboards", intent: "find_best" },
];

export default function PromptsPage() {
  const [selectedIntent, setSelectedIntent] = useState<LLMIntentType>("seek_explanation");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [tab, setTab] = useState<"database" | "simulate">("database");

  // Read live from the mutable product prompt database
  const [, forceUpdate] = useState(0);
  const allPrompts: ProductPrompt[] = getProductPrompts(PRODUCT_ID);

  const activeIntentMeta = INTENT_META.find((m) => m.id === selectedIntent)!;
  const intentPrompts = allPrompts.filter((p) => p.intent === selectedIntent);

  const totalPrompts = allPrompts.length;
  const coveredPrompts = allPrompts.filter((p) => p.covered).length;

  function handleDiscover() {
    setIsDiscovering(true);
    setTimeout(() => {
      addPromptsToProduct(PRODUCT_ID, DISCOVERED_PROMPTS.map(p => ({ ...p, covered: false })));
      setIsDiscovering(false);
      forceUpdate((n) => n + 1);
      toast.success(`${DISCOVERED_PROMPTS.length} new prompts discovered from your content!`);
    }, 2000);
  }

  function handleAddCustomPrompt() {
    if (!customPrompt.trim()) return;
    addPromptsToProduct(PRODUCT_ID, [{ text: customPrompt.trim(), intent: selectedIntent, covered: false }]);
    toast.success("Prompt added to database");
    setCustomPrompt("");
    forceUpdate((n) => n + 1);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Discovery Prompt Engine</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage the prompts users ask AI systems — organised by how they interact with the LLM
          </p>
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
          <p className="text-xs text-muted-foreground mt-0.5">Coverage Gaps</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
        <button
          onClick={() => setTab("database")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === "database" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Prompt Database
        </button>
        <button
          onClick={() => setTab("simulate")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === "simulate" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Quick Simulate
        </button>
      </div>

      {tab === "database" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Intent list (left) */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-3">
              User Interaction Intents
            </p>
            {INTENT_META.map((meta) => {
              const count = allPrompts.filter((p) => p.intent === meta.id).length;
              const covered = allPrompts.filter((p) => p.intent === meta.id && p.covered).length;
              return (
                <button
                  key={meta.id}
                  onClick={() => setSelectedIntent(meta.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                    selectedIntent === meta.id
                      ? "border-primary/50 bg-primary/10"
                      : "border-border hover:border-primary/30 bg-card"
                  }`}
                >
                  <div className={meta.color}>{meta.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{meta.label}</p>
                    <p className="text-xs text-muted-foreground">{count} prompts · {covered} covered</p>
                  </div>
                  {count > 0 && (
                    <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-green-400 rounded-full"
                        style={{ width: `${count > 0 ? (covered / count) * 100 : 0}%` }}
                      />
                    </div>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Prompt list (right) */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <div className={activeIntentMeta.color}>{activeIntentMeta.icon}</div>
              <div>
                <h2 className="font-semibold">{activeIntentMeta.label}</h2>
                <p className="text-xs text-muted-foreground">{activeIntentMeta.desc}</p>
              </div>
              <span className="ml-auto text-xs text-muted-foreground">{intentPrompts.length} prompts</span>
            </div>

            {/* Intent description callout */}
            <div className="px-5 py-3 border-b border-border bg-muted/20">
              <p className="text-xs text-muted-foreground">
                Example: <span className="italic text-foreground/70">{activeIntentMeta.example}</span>
              </p>
            </div>

            {intentPrompts.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                <p className="text-sm">No prompts for this intent yet.</p>
                <p className="text-xs mt-1">
                  Use the "Generate Prompts" feature in any content item, or add one manually below.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {intentPrompts.map((prompt) => (
                  <div key={prompt.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{prompt.text}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {prompt.covered ? (
                        <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Covered
                        </span>
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
            )}

            <div className="px-5 py-4 border-t border-border flex items-center gap-2">
              <input
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustomPrompt()}
                placeholder={`Add custom "${activeIntentMeta.label}" prompt…`}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                onClick={handleAddCustomPrompt}
                disabled={!customPrompt.trim()}
                className="rounded-lg border border-border px-3 py-2 hover:bg-accent disabled:opacity-60 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "simulate" && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Quick Prompt Simulation</h2>
          <p className="text-sm text-muted-foreground">
            Test a specific prompt across all major LLMs to see how your product ranks.
          </p>
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
              onClick={() => {
                toast.success("Simulation queued — check LLM Simulation page");
                setCustomPrompt("");
              }}
              disabled={!customPrompt.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2"
            >
              <BarChart2 className="h-4 w-4" /> Simulate
            </button>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Prompts from your database:</p>
            {allPrompts.slice(0, 6).map((p) => (
              <button
                key={p.id}
                onClick={() => setCustomPrompt(p.text)}
                className="w-full text-left text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Search className="h-3 w-3 flex-shrink-0" /> {p.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
