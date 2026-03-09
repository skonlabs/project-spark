import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AlertTriangle, CheckCircle2, Loader2, Package2, Plus, Swords, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { MOCK_PRODUCTS } from "@/data/products";

const COMPETITOR_DATA: Record<string, Array<{ name: string; share: number; isYou: boolean; strengths: string[]; gaps: string[] }>> = {
  "product-gaeo": [
    { name: "GAEO Platform", share: 18, isYou: true, strengths: ["Entity definition", "Docs structure"], gaps: ["FAQ coverage", "Comparison content", "Community"] },
    { name: "Competitor A", share: 34, isYou: false, strengths: ["FAQ coverage", "Blog volume", "Community"], gaps: ["Technical depth", "API docs"] },
    { name: "Competitor B", share: 27, isYou: false, strengths: ["Comparison content", "Case studies"], gaps: ["Entity clarity", "FAQ coverage"] },
    { name: "Competitor C", share: 12, isYou: false, strengths: ["Pricing transparency"], gaps: ["Content volume", "Educational depth"] },
    { name: "Others", share: 9, isYou: false, strengths: [], gaps: [] },
  ],
  "product-datasync": [
    { name: "DataSync", share: 22, isYou: true, strengths: ["Documentation", "Entity clarity"], gaps: ["Comparison content", "Community", "Blog volume"] },
    { name: "Airbyte", share: 41, isYou: false, strengths: ["Community", "Open source content", "FAQ coverage"], gaps: ["Enterprise positioning"] },
    { name: "Fivetran", share: 28, isYou: false, strengths: ["Case studies", "Comparison tables"], gaps: ["Technical depth"] },
    { name: "Others", share: 9, isYou: false, strengths: [], gaps: [] },
  ],
};

const COLORS = ["#6366f1", "#ef4444", "#f97316", "#eab308", "#6b7280"];

export default function CompetitivePage() {
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0].id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [competitors, setCompetitors] = useState(COMPETITOR_DATA);

  const list = competitors[selectedProduct] ?? [];
  const youEntry = list.find((c) => c.isYou);
  const sorted = [...list].sort((a, b) => b.share - a.share);
  const topComp = sorted[0];
  const yourRank = sorted.findIndex((c) => c.isYou) + 1;

  function handleRunAnalysis() {
    setIsAnalyzing(true);
    toast.success("Running competitive analysis across Claude, GPT-4, and Gemini…");
    setTimeout(() => { setIsAnalyzing(false); toast.success("Analysis complete — share of voice updated!"); }, 2500);
  }

  function handleAddCompetitor() {
    if (!newName.trim()) return;
    setCompetitors((prev) => ({
      ...prev,
      [selectedProduct]: [...(prev[selectedProduct] ?? []), { name: newName.trim(), share: Math.floor(Math.random() * 12) + 3, isYou: false, strengths: [], gaps: ["Analysis pending"] }],
    }));
    toast.success(`"${newName}" added — re-run analysis to get their data.`);
    setNewName(""); setShowAddForm(false);
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="page-header pb-0">
          <h1>Competitive Analysis</h1>
          <p>How often does each product appear in AI answers vs. the competition?</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium hover:bg-accent transition-all">
            <Plus className="h-4 w-4" /> Add Competitor
          </button>
          <button onClick={handleRunAnalysis} disabled={isAnalyzing} className="btn-primary rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-60 transition-all">
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
            {isAnalyzing ? "Analyzing…" : "Run Analysis"}
          </button>
        </div>
      </motion.div>

      <div className="rounded-2xl border border-border/60 bg-card/80 px-6 py-4 text-sm text-muted-foreground backdrop-blur-sm">
        <strong className="text-foreground font-semibold">How it works:</strong> GAEO sends common AI queries to Claude, GPT-4o, and Gemini, tracks which products are mentioned, and calculates each product's <em>share of voice</em>.
      </div>

      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Select Product</p>
        <div className="flex gap-2 flex-wrap">
          {MOCK_PRODUCTS.map((p) => (
            <button key={p.id} onClick={() => setSelectedProduct(p.id)} className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${selectedProduct === p.id ? "border-primary/30 bg-primary/10 text-foreground shadow-sm" : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
              <Package2 className="h-3.5 w-3.5" /> {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {[
          { label: "Your Share of Voice", value: `${youEntry?.share ?? 0}%`, note: "of AI answers mention you", color: "text-primary" },
          { label: "Your Rank", value: `#${yourRank}`, note: `of ${list.length} products in category`, color: yourRank <= 2 ? "text-emerald-400" : "text-orange-400" },
          { label: "Gap to Leader", value: topComp?.isYou ? "You're #1!" : `${(topComp?.share ?? 0) - (youEntry?.share ?? 0)}%`, note: topComp?.isYou ? "Keep publishing" : `behind ${topComp?.name}`, color: topComp?.isYou ? "text-emerald-400" : "text-red-400" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card text-center">
            <p className={`text-3xl font-black ${kpi.color} tabular-nums`}>{kpi.value}</p>
            <p className="text-sm font-semibold mt-1">{kpi.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.note}</p>
          </motion.div>
        ))}
      </div>

      <div className="section-card p-6">
        <h2 className="font-bold mb-5 text-sm">AI Share of Voice — {MOCK_PRODUCTS.find((p) => p.id === selectedProduct)?.name}</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={list} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215 20.2% 55%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(215 20.2% 55%)" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => [`${v}%`, "Share of Voice"]} contentStyle={{ background: "hsl(228 14% 7%)", border: "1px solid hsl(217 20% 16%)", borderRadius: "12px", fontSize: "12px" }} />
            <Bar dataKey="share" radius={[6, 6, 0, 0]}>
              {list.map((entry, i) => <Cell key={i} fill={entry.isYou ? "#6366f1" : COLORS[Math.min(i, COLORS.length - 1)]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {list.filter((c) => c.name !== "Others").map((comp, i) => (
          <motion.div key={comp.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`rounded-2xl border p-5 transition-all ${comp.isYou ? "border-primary/20 bg-primary/5" : "border-border/60 bg-card/80"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: comp.isYou ? "#6366f1" : COLORS[Math.min(i + 1, COLORS.length - 1)] }} />
                <span className="font-bold text-sm">{comp.name}</span>
                {comp.isYou && <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold border border-primary/20">YOU</span>}
              </div>
              <span className="text-lg font-black tabular-nums">{comp.share}%</span>
            </div>
            <div className="h-2 bg-muted/60 rounded-full mb-4 overflow-hidden">
              <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${comp.share}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                style={{ background: comp.isYou ? "#6366f1" : COLORS[Math.min(i + 1, COLORS.length - 1)], boxShadow: `0 0 8px ${comp.isYou ? "rgb(99 102 241 / 0.3)" : "transparent"}` }}
              />
            </div>
            {comp.strengths.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Strengths</p>
                <div className="flex flex-wrap gap-1">
                  {comp.strengths.map((s) => <span key={s} className="text-[10px] flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2 py-0.5 rounded-full"><CheckCircle2 className="h-2.5 w-2.5" /> {s}</span>)}
                </div>
              </div>
            )}
            {comp.gaps.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Gaps</p>
                <div className="flex flex-wrap gap-1">
                  {comp.gaps.map((g) => <span key={g} className="text-[10px] flex items-center gap-0.5 bg-red-500/10 text-red-400 border border-red-500/15 px-2 py-0.5 rounded-full"><AlertTriangle className="h-2.5 w-2.5" /> {g}</span>)}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddForm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border/60 rounded-2xl p-6 w-full max-w-sm shadow-2xl gradient-border" onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold">Add Competitor</h2>
                <button onClick={() => setShowAddForm(false)}><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
              </div>
              <input autoFocus type="text" placeholder="Competitor name (e.g. LangSmith)" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddCompetitor()}
                className="w-full rounded-xl border border-input bg-background/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 mb-5"
              />
              <div className="flex gap-2">
                <button onClick={handleAddCompetitor} disabled={!newName.trim()} className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-primary/20">Add Competitor</button>
                <button onClick={() => setShowAddForm(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm hover:bg-accent transition-colors">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
