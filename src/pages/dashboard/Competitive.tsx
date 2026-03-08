import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AlertTriangle, CheckCircle2, Loader2, Package2, Plus, Swords, X } from "lucide-react";
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Competitive Analysis</h1>
          <p className="text-muted-foreground text-sm mt-0.5">How often does each product appear in AI answers vs. the competition?</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent transition-colors">
            <Plus className="h-4 w-4" /> Add Competitor
          </button>
          <button onClick={handleRunAnalysis} disabled={isAnalyzing} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
            {isAnalyzing ? "Analyzing…" : "Run Analysis"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 px-5 py-3 text-sm text-muted-foreground">
        <strong className="text-foreground">How it works:</strong> GAEO sends common AI queries for your product category to Claude, GPT-4o, and Gemini. It tracks which products are mentioned and calculates each product's <em>share of voice</em> — how often it appears relative to competitors.
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Select Product</p>
        <div className="flex gap-2 flex-wrap">
          {MOCK_PRODUCTS.map((p) => (
            <button key={p.id} onClick={() => setSelectedProduct(p.id)} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${selectedProduct === p.id ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
              <Package2 className="h-3.5 w-3.5" /> {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Your Share of Voice", value: `${youEntry?.share ?? 0}%`, note: "of AI answers mention you", color: "text-primary" },
          { label: "Your Rank", value: `#${yourRank}`, note: `of ${list.length} products in category`, color: yourRank <= 2 ? "text-green-400" : "text-orange-400" },
          { label: "Gap to Leader", value: topComp?.isYou ? "You're #1!" : `${(topComp?.share ?? 0) - (youEntry?.share ?? 0)}%`, note: topComp?.isYou ? "Keep publishing" : `behind ${topComp?.name}`, color: topComp?.isYou ? "text-green-400" : "text-red-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-card p-5 text-center">
            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-sm font-medium mt-1">{kpi.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.note}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-4 text-sm">AI Share of Voice — {MOCK_PRODUCTS.find((p) => p.id === selectedProduct)?.name}</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={list} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [`${v}%`, "Share of Voice"]} />
            <Bar dataKey="share" radius={[4, 4, 0, 0]}>
              {list.map((entry, i) => <Cell key={i} fill={entry.isYou ? "#6366f1" : COLORS[Math.min(i, COLORS.length - 1)]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.filter((c) => c.name !== "Others").map((comp, i) => (
          <div key={comp.name} className={`rounded-xl border p-4 ${comp.isYou ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: comp.isYou ? "#6366f1" : COLORS[Math.min(i + 1, COLORS.length - 1)] }} />
                <span className="font-medium text-sm">{comp.name}</span>
                {comp.isYou && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">YOU</span>}
              </div>
              <span className="text-lg font-bold">{comp.share}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full mb-3 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${comp.share}%`, background: comp.isYou ? "#6366f1" : COLORS[Math.min(i + 1, COLORS.length - 1)] }} />
            </div>
            {comp.strengths.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Content strengths</p>
                <div className="flex flex-wrap gap-1">
                  {comp.strengths.map((s) => <span key={s} className="text-[10px] flex items-center gap-0.5 bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded"><CheckCircle2 className="h-2.5 w-2.5" /> {s}</span>)}
                </div>
              </div>
            )}
            {comp.gaps.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Content gaps</p>
                <div className="flex flex-wrap gap-1">
                  {comp.gaps.map((g) => <span key={g} className="text-[10px] flex items-center gap-0.5 bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded"><AlertTriangle className="h-2.5 w-2.5" /> {g}</span>)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowAddForm(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Add Competitor</h2>
              <button onClick={() => setShowAddForm(false)}><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
            </div>
            <input autoFocus type="text" placeholder="Competitor name (e.g. LangSmith)" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddCompetitor()} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4" />
            <div className="flex gap-2">
              <button onClick={handleAddCompetitor} disabled={!newName.trim()} className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">Add Competitor</button>
              <button onClick={() => setShowAddForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
