import { useState } from "react";
import {
  Search, Sparkles, TrendingUp, HelpCircle, Swords, BookOpen,
  Hash, Wrench, Plus, Play, ChevronRight, BarChart2, Loader2, CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  getProductPrompts, addPromptsToProduct,
  type LLMIntentType, type ProductPrompt,
} from "@/data/products";

interface IntentMeta {
  id: LLMIntentType; label: string; desc: string; icon: React.ReactNode; color: string; gradient: string; example: string;
}

const INTENT_META: IntentMeta[] = [
  { id: "seek_explanation", label: "Explain / What is", desc: "User asks the AI to explain or define something", icon: <HelpCircle className="h-4 w-4" />, color: "text-blue-400", gradient: "from-blue-500 to-cyan-500", example: '"What is AI observability?"' },
  { id: "find_best", label: "Find the best", desc: "User asks for top tools or recommendations", icon: <TrendingUp className="h-4 w-4" />, color: "text-emerald-400", gradient: "from-emerald-500 to-green-500", example: '"Best LLM monitoring tools 2026"' },
  { id: "compare", label: "Compare options", desc: "User compares two or more products side-by-side", icon: <Swords className="h-4 w-4" />, color: "text-orange-400", gradient: "from-orange-500 to-amber-500", example: '"GAEO vs LangSmith"' },
  { id: "learn_howto", label: "Learn how-to", desc: "User wants step-by-step guidance", icon: <BookOpen className="h-4 w-4" />, color: "text-amber-400", gradient: "from-amber-500 to-yellow-500", example: '"How to monitor LLM apps in production?"' },
  { id: "find_alternative", label: "Find alternatives", desc: "User looking for alternatives to a tool", icon: <Hash className="h-4 w-4" />, color: "text-violet-400", gradient: "from-violet-500 to-purple-500", example: '"LangSmith alternatives"' },
  { id: "troubleshoot", label: "Troubleshoot / Fix", desc: "User diagnosing a problem or seeking a fix", icon: <Wrench className="h-4 w-4" />, color: "text-rose-400", gradient: "from-rose-500 to-red-500", example: '"Why is my LLM giving wrong answers?"' },
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
      toast.success(`${DISCOVERED_PROMPTS.length} new prompts discovered!`);
    }, 2000);
  }

  function handleAddCustomPrompt() {
    if (!customPrompt.trim()) return;
    addPromptsToProduct(PRODUCT_ID, [{ text: customPrompt.trim(), intent: selectedIntent, covered: false }]);
    toast.success("Prompt added");
    setCustomPrompt(""); forceUpdate((n) => n + 1);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Prompt Engine</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage prompts users ask AI systems — by interaction intent</p>
        </div>
        <button onClick={handleDiscover} disabled={isDiscovering} className="btn-primary text-xs px-4 py-2">
          {isDiscovering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {isDiscovering ? "Discovering..." : "Discover Prompts"}
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: totalPrompts, label: "Total Prompts", gradient: "from-violet-500/10 to-purple-500/5" },
          { value: coveredPrompts, label: "Covered", gradient: "from-emerald-500/10 to-green-500/5" },
          { value: totalPrompts - coveredPrompts, label: "Gaps", gradient: "from-rose-500/10 to-red-500/5" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`bento-card text-center bg-gradient-to-br ${stat.gradient}`}
          >
            <p className="text-3xl font-black tabular-nums" style={{ fontFamily: "'Space Grotesk'" }}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button onClick={() => setTab("database")} data-active={tab === "database" ? "true" : "false"}>Prompt Database</button>
        <button onClick={() => setTab("simulate")} data-active={tab === "simulate" ? "true" : "false"}>Quick Simulate</button>
      </div>

      {tab === "database" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Intent list */}
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 px-1 mb-3">Interaction Intents</p>
            {INTENT_META.map((meta) => {
              const count = allPrompts.filter((p) => p.intent === meta.id).length;
              const covered = allPrompts.filter((p) => p.intent === meta.id && p.covered).length;
              return (
                <button key={meta.id} onClick={() => setSelectedIntent(meta.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                    selectedIntent === meta.id ? "border-primary/25 bg-primary/5" : "border-border/30 hover:border-primary/15 bg-card/50"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white flex-shrink-0`}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs">{meta.label}</p>
                    <p className="text-[10px] text-muted-foreground tabular-nums font-mono">{count} · {covered} covered</p>
                  </div>
                  {count > 0 && (
                    <div className="h-1 w-10 rounded-full bg-border/50 overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${count > 0 ? (covered / count) * 100 : 0}%` }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Prompt list */}
          <div className="lg:col-span-2 section-card">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border/30">
              <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${activeIntentMeta.gradient} flex items-center justify-center text-white flex-shrink-0`}>
                {activeIntentMeta.icon}
              </div>
              <div>
                <h2 className="font-bold text-sm" style={{ fontFamily: "'Space Grotesk'" }}>{activeIntentMeta.label}</h2>
                <p className="text-[10px] text-muted-foreground">{activeIntentMeta.desc}</p>
              </div>
              <span className="ml-auto text-[10px] text-muted-foreground tabular-nums font-mono">{intentPrompts.length} prompts</span>
            </div>
            <div className="px-6 py-2.5 border-b border-border/30 bg-muted/10">
              <p className="text-[10px] text-muted-foreground">Example: <span className="italic text-foreground/60 font-mono">{activeIntentMeta.example}</span></p>
            </div>

            {intentPrompts.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <p className="text-sm font-medium">No prompts yet.</p>
                <p className="text-[10px] mt-1 text-muted-foreground/60">Use "Discover Prompts" or add one below.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {intentPrompts.map((prompt) => (
                  <div key={prompt.id} className="flex items-center gap-3 px-6 py-3 hover:bg-accent/15 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{prompt.text}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {prompt.covered ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Covered
                        </span>
                      ) : (
                        <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/15 px-2 py-0.5 rounded-full font-medium">Gap</span>
                      )}
                      <button onClick={() => toast.success("Added to simulation queue")}
                        className="rounded-lg border border-border/30 p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-accent/30 transition-all"
                      >
                        <Play className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="px-6 py-3.5 border-t border-border/30 flex items-center gap-2">
              <input value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddCustomPrompt()}
                placeholder={`Add "${activeIntentMeta.label}" prompt…`}
                className="input-field flex-1"
              />
              <button onClick={handleAddCustomPrompt} disabled={!customPrompt.trim()}
                className="rounded-xl border border-border/30 px-3 py-2.5 hover:bg-accent/30 disabled:opacity-40 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "simulate" && (
        <div className="bento-card space-y-5">
          <h2 className="font-bold text-sm" style={{ fontFamily: "'Space Grotesk'" }}>Quick Prompt Simulation</h2>
          <p className="text-xs text-muted-foreground">Test a prompt across all major LLMs to see how your product ranks.</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 text-muted-foreground/50 absolute left-4 top-1/2 -translate-y-1/2" />
              <input value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="What are the best AI observability tools?"
                className="input-field pl-10"
              />
            </div>
            <button onClick={() => { toast.success("Simulation queued"); setCustomPrompt(""); }} disabled={!customPrompt.trim()}
              className="btn-primary text-xs px-4 py-2.5"
            >
              <BarChart2 className="h-3.5 w-3.5" /> Simulate
            </button>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] text-muted-foreground/60 font-bold mb-2 uppercase tracking-wider">From your database:</p>
            {allPrompts.slice(0, 5).map((p) => (
              <button key={p.id} onClick={() => setCustomPrompt(p.text)}
                className="w-full text-left text-xs text-muted-foreground/60 hover:text-foreground flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent/20 transition-all"
              >
                <Search className="h-2.5 w-2.5 flex-shrink-0" /> {p.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
