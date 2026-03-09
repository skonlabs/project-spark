import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Sparkles, ArrowRight, Brain, Zap, FileText, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { useContent } from "@/contexts/ContentContext";

const MOCK_NODES = [
  { id: "root", label: "AI Observability", depth: 0, covered: true, importance: 10, type: "core", x: 400, y: 300, contentIds: ["c1", "c2"] },
  { id: "monitoring", label: "LLM Monitoring", depth: 1, covered: true, importance: 9, type: "core", x: 150, y: 150, contentIds: ["c2"] },
  { id: "evaluation", label: "LLM Evaluation", depth: 1, covered: false, importance: 9, type: "gap", x: 650, y: 150, contentIds: [] },
  { id: "debugging", label: "AI Debugging", depth: 1, covered: false, importance: 8, type: "gap", x: 150, y: 450, contentIds: [] },
  { id: "performance", label: "Performance", depth: 1, covered: true, importance: 7, type: "core", x: 650, y: 450, contentIds: ["c4"] },
  { id: "security", label: "AI Security", depth: 1, covered: false, importance: 8, type: "gap", x: 400, y: 520, contentIds: [] },
  { id: "tracing", label: "Distributed Tracing", depth: 2, covered: true, importance: 7, type: "core", x: 50, y: 80, contentIds: ["c2"] },
  { id: "logging", label: "LLM Logging", depth: 2, covered: true, importance: 8, type: "core", x: 200, y: 60, contentIds: ["c2"] },
  { id: "benchmarks", label: "Benchmarking", depth: 2, covered: false, importance: 7, type: "gap", x: 580, y: 70, contentIds: [] },
  { id: "testing", label: "LLM Testing", depth: 2, covered: false, importance: 8, type: "gap", x: 750, y: 90, contentIds: [] },
  { id: "prompt-injection", label: "Prompt Injection", depth: 2, covered: false, importance: 9, type: "gap", x: 350, y: 590, contentIds: [] },
  { id: "latency", label: "Latency Optimization", depth: 2, covered: true, importance: 6, type: "core", x: 720, y: 500, contentIds: ["c4"] },
  { id: "cost", label: "Cost Tracking", depth: 2, covered: false, importance: 7, type: "gap", x: 600, y: 540, contentIds: [] },
];

const MOCK_EDGES = [
  { source: "root", target: "monitoring" }, { source: "root", target: "evaluation" },
  { source: "root", target: "debugging" }, { source: "root", target: "performance" },
  { source: "root", target: "security" }, { source: "monitoring", target: "tracing" },
  { source: "monitoring", target: "logging" }, { source: "evaluation", target: "benchmarks" },
  { source: "evaluation", target: "testing" }, { source: "security", target: "prompt-injection" },
  { source: "performance", target: "latency" }, { source: "performance", target: "cost" },
];

export default function TopicsPage() {
  const { products } = useContent();
  const [selectedNode, setSelectedNode] = useState<typeof MOCK_NODES[0] | null>(null);
  const [filter, setFilter] = useState<"all" | "covered" | "gaps">("all");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [scopeType, setScopeType] = useState<"project" | "content">("project");
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? "");
  const [selectedContentId, setSelectedContentId] = useState("");
  const navigate = useNavigate();

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const allContent = useMemo(() => {
    return products.flatMap((p) => p.folders.flatMap((f) => f.items.map((item) => ({ ...item, productName: p.name, folderName: f.name }))));
  }, [products]);

  const selectedContent = allContent.find((c) => c.id === selectedContentId);

  function handleRegenerate() {
    setIsRegenerating(true);
    toast.success("Regenerating topic graph from your content...");
    setTimeout(() => { setIsRegenerating(false); toast.success("Topic graph updated!"); }, 2000);
  }

  const filteredNodes = MOCK_NODES.filter((n) => {
    if (filter === "covered") return n.covered;
    if (filter === "gaps") return !n.covered;
    return true;
  });

  const stats = {
    total: MOCK_NODES.length,
    covered: MOCK_NODES.filter((n) => n.covered).length,
    gaps: MOCK_NODES.filter((n) => !n.covered).length,
  };

  const getNodeColor = (node: typeof MOCK_NODES[0]) => {
    if (!node.covered) return "#ef4444";
    if (node.depth === 0) return "#3b82f6";
    if (node.depth === 1) return "#8b5cf6";
    return "#10b981";
  };

  return (
    <div className="p-6 space-y-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Topic Ecosystem Map</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Visualize content coverage across your topic landscape</p>
        </div>
        <button onClick={handleRegenerate} disabled={isRegenerating}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-60">
          {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {isRegenerating ? "Regenerating..." : "Regenerate Graph"}
        </button>
      </div>

      {/* Scope selector */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Generate topics for:</span>
          <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
            {([{ id: "project", label: "Project" }, { id: "content", label: "Content" }] as const).map((s) => (
              <button key={s.id} onClick={() => setScopeType(s.id)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${scopeType === s.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        {scopeType === "project" ? (
          <div className="flex gap-2 flex-wrap">
            {products.map((p) => (
              <button key={p.id} onClick={() => setSelectedProductId(p.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedProductId === p.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                }`}>
                {p.name}
              </button>
            ))}
          </div>
        ) : (
          <select value={selectedContentId} onChange={(e) => setSelectedContentId(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring w-full max-w-sm">
            <option value="">Select content...</option>
            {allContent.filter((c) => c.status === "analyzed").map((c) => (
              <option key={c.id} value={c.id}>{c.productName} → {c.title}</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Topics", value: stats.total, color: "text-foreground" },
          { label: "Covered", value: stats.covered, color: "text-green-400" },
          { label: "Content Gaps", value: stats.gaps, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4 overflow-hidden" style={{ height: "500px" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Topic Graph — {scopeType === "project" ? selectedProduct?.name : selectedContent?.title || "Select content"}</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" /> Covered</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" /> Gap</span>
            </div>
          </div>
          <svg width="100%" height="420" viewBox="0 0 800 600" className="overflow-visible">
            {MOCK_EDGES.map((edge) => {
              const source = MOCK_NODES.find((n) => n.id === edge.source);
              const target = MOCK_NODES.find((n) => n.id === edge.target);
              if (!source || !target) return null;
              return <line key={`${edge.source}-${edge.target}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="hsl(217.2 32.6% 17.5%)" strokeWidth="1.5" />;
            })}
            {filteredNodes.map((node) => {
              const color = getNodeColor(node);
              const isSelected = selectedNode?.id === node.id;
              const radius = node.depth === 0 ? 35 : node.depth === 1 ? 28 : 22;
              return (
                <g key={node.id} onClick={() => setSelectedNode(isSelected ? null : node)} className="cursor-pointer">
                  <circle cx={node.x} cy={node.y} r={radius} fill={color} fillOpacity={isSelected ? 1 : 0.15} stroke={color} strokeWidth={isSelected ? 3 : 1.5} />
                  <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central" fontSize={node.depth === 0 ? 11 : 9} fill={color} fontWeight={node.depth === 0 ? "bold" : "normal"}>
                    {node.label.split(" ").map((word, i, arr) => (
                      <tspan key={i} x={node.x} dy={i === 0 ? -(arr.length - 1) * 6 : 12}>{word}</tspan>
                    ))}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-3">
          <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
            {[{ id: "all", label: "All" }, { id: "covered", label: "Covered" }, { id: "gaps", label: "Gaps" }].map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id as any)}
                className={`flex-1 rounded-md py-1 text-xs font-medium transition-colors ${filter === f.id ? "bg-background shadow-sm" : "text-muted-foreground"}`}>{f.label}</button>
            ))}
          </div>
          <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
            {filteredNodes.map((node) => (
              <button key={node.id} onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                className={`w-full flex items-center gap-2 rounded-lg p-2.5 text-left transition-colors ${selectedNode?.id === node.id ? "bg-primary/15 border border-primary/30" : "hover:bg-accent/50"}`}>
                {node.covered ? <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <span className="text-sm truncate block">{node.label}</span>
                  {node.contentIds.length > 0 && (
                    <span className="text-[10px] text-muted-foreground">{node.contentIds.length} content linked</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-10 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${node.importance * 10}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{node.importance}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedNode && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                {selectedNode.covered ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
                {selectedNode.label}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedNode.covered ? "This topic is covered by your content." : "Content gap — create content to fill this topic."}
              </p>
              {selectedNode.contentIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedNode.contentIds.map((cid) => {
                    const content = allContent.find((c) => c.id === cid);
                    return content ? (
                      <Link key={cid} to={`/dashboard/content/${cid}`}
                        className="inline-flex items-center gap-1 text-xs bg-accent/30 rounded-lg px-2 py-1 hover:bg-accent/50 transition-colors">
                        <FileText className="h-3 w-3" /> {content.title}
                      </Link>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${selectedNode.covered ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
              Importance: {selectedNode.importance}/10
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
            {!selectedNode.covered && (
              <Link to={`/dashboard/content/generate?topic=${encodeURIComponent(selectedNode.label)}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                <Sparkles className="h-4 w-4" /> Generate Content
              </Link>
            )}
            <Link to={`/dashboard/simulation?prompt=${encodeURIComponent(`What is ${selectedNode.label}?`)}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Brain className="h-4 w-4" /> {selectedNode.covered ? "Test in Simulation" : "Simulate Prompt"}
            </Link>
            {selectedNode.covered && (
              <Link to="/dashboard/analysis"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                View Analysis
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
