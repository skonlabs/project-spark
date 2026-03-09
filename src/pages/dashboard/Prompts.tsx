import { useState, useMemo } from "react";
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
  ChevronRight,
  BarChart2,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { INTENT_DEFINITIONS, type LLMIntentType } from "@/data/products";
import { useContent } from "@/contexts/ContentContext";

// ─── Intent icons/colors (Prompts-page presentation layer only) ───────────────

const INTENT_ICONS: Record<LLMIntentType, { icon: React.ReactNode; color: string }> = {
  seek_explanation: { icon: <HelpCircle className="h-4 w-4" />, color: "text-blue-400" },
  find_best:        { icon: <TrendingUp className="h-4 w-4" />, color: "text-green-400" },
  compare:          { icon: <Swords    className="h-4 w-4" />, color: "text-orange-400" },
  learn_howto:      { icon: <BookOpen  className="h-4 w-4" />, color: "text-yellow-400" },
  find_alternative: { icon: <Hash      className="h-4 w-4" />, color: "text-purple-400" },
  troubleshoot:     { icon: <Wrench    className="h-4 w-4" />, color: "text-red-400" },
};

const DISCOVERED_PROMPTS: Array<{ text: string; intent: LLMIntentType }> = [
  { text: "What tools help monitor LLM outputs in production?",        intent: "find_best" },
  { text: "How do I track which prompts my users are sending to AI?",  intent: "learn_howto" },
  { text: "Best AI observability platform for enterprise teams",        intent: "find_best" },
  { text: "What is prompt drift and how do I detect it?",              intent: "seek_explanation" },
  { text: "GAEO vs Arize AI — which is better for LLM monitoring?",   intent: "compare" },
  { text: "Open-source alternatives to GAEO for AI observability",     intent: "find_alternative" },
  { text: "Why are my LLM responses getting worse over time?",         intent: "troubleshoot" },
  { text: "How to set up automated regression testing for LLMs",       intent: "learn_howto" },
  { text: "What metrics should I track for production LLM apps?",      intent: "seek_explanation" },
  { text: "Cheapest LLM observability tool with good dashboards",      intent: "find_best" },
];

export default function PromptsPage() {
  const { products, getProductPrompts, addPromptsToProduct } = useContent();

  const [selectedProductId, setSelectedProductId] = useState(() => products[0]?.id ?? "");
  const [selectedIntent, setSelectedIntent] = useState<LLMIntentType>("seek_explanation");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [tab, setTab] = useState<"database" | "simulate">("database");

  // Derived from context state — no forceUpdate needed
  const allPrompts = getProductPrompts(selectedProductId);

  const activeIntentDef = useMemo(
    () => INTENT_DEFINITIONS.find((d) => d.id === selectedIntent)!,
    [selectedIntent]
  );
  const intentPrompts = useMemo(
    () => allPrompts.filter((p) => p.intent === selectedIntent),
    [allPrompts, selectedIntent]
  );
  const coveredCount = useMemo(() => allPrompts.filter((p) => p.covered).length, [allPrompts]);

  function handleDiscover() {
    setIsDiscovering(true);
    setTimeout(() => {
      addPromptsToProduct(selectedProductId, DISCOVERED_PROMPTS);
      setIsDiscovering(false);
      toast.success(`${DISCOVERED_PROMPTS.length} new prompts discovered from your content!`);
    }, 2000);
  }

  function handleAddCustomPrompt() {
    const text = customPrompt.trim();
    if (!text) return;
    addPromptsToProduct(selectedProductId, [{ text, intent: selectedIntent, covered: false }]);
    toast.success("Prompt added to database");
    setCustomPrompt("");
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">AI Discovery Prompt Engine</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage the prompts users ask AI systems — organised by how they interact with the LLM
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Product selector */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <span className="text-xs text-muted-foreground font-medium">Product:</span>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{allPrompts.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Prompts</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{coveredCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Content Covered</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{allPrompts.length - coveredCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Coverage Gaps</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
        {(["database", "simulate"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === t ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t === "database" ? "Prompt Database" : "Quick Simulate"}
          </button>
        ))}
      </div>

      {tab === "database" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Intent list */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-3">
              User Interaction Intents
            </p>
            {INTENT_DEFINITIONS.map((def) => {
              const { icon, color } = INTENT_ICONS[def.id];
              const count   = allPrompts.filter((p) => p.intent === def.id).length;
              const covered = allPrompts.filter((p) => p.intent === def.id && p.covered).length;
              return (
                <button
                  key={def.id}
                  onClick={() => setSelectedIntent(def.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                    selectedIntent === def.id
                      ? "border-primary/50 bg-primary/10"
                      : "border-border hover:border-primary/30 bg-card"
                  }`}
                >
                  <div className={color}>{icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{def.label}</p>
                    <p className="text-xs text-muted-foreground">{count} prompts · {covered} covered</p>
                  </div>
                  {count > 0 && (
                    <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-green-400 rounded-full"
                        style={{ width: `${(covered / count) * 100}%` }}
                      />
                    </div>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Prompt list */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <div className={INTENT_ICONS[activeIntentDef.id].color}>
                {INTENT_ICONS[activeIntentDef.id].icon}
              </div>
              <div>
                <h2 className="font-semibold">{activeIntentDef.label}</h2>
                <p className="text-xs text-muted-foreground">{activeIntentDef.desc}</p>
              </div>
              <span className="ml-auto text-xs text-muted-foreground">{intentPrompts.length} prompts</span>
            </div>

            <div className="px-5 py-3 border-b border-border bg-muted/20">
              <p className="text-xs text-muted-foreground">
                Example: <span className="italic text-foreground/70">{activeIntentDef.example}</span>
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
                placeholder={`Add custom "${activeIntentDef.label}" prompt…`}
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
            Test a specific prompt across all major LLMs to see how your product ranks. Results appear in the{" "}
            <strong>{selectedProduct?.name ?? "selected product"}</strong> analysis.
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
                if (!customPrompt.trim()) return;
                addPromptsToProduct(selectedProductId, [{ text: customPrompt.trim(), intent: "seek_explanation", covered: false }]);
                toast.success("Prompt added to database and queued for simulation");
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
