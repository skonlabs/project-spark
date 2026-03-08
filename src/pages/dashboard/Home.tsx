import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  File,
  Folder,
  Package2,
  Plus,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { MOCK_PRODUCTS, getAllContent, getProductStats, CONTENT_ANALYSIS } from "@/data/products";

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-muted-foreground">Pending</span>;
  const color =
    score >= 65
      ? "bg-green-500/15 text-green-400 border-green-500/30"
      : score >= 45
      ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
      : "bg-red-500/15 text-red-400 border-red-500/30";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      {score}/100
    </span>
  );
}

function RelativeTime({ iso }: { iso: string }) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  if (days > 0) return <>{days}d ago</>;
  if (hours > 0) return <>{hours}h ago</>;
  return <>just now</>;
}

export default function HomePage() {
  const [showQuickIngest, setShowQuickIngest] = useState(false);
  const [ingestUrl, setIngestUrl] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0].id);
  const [selectedFolder, setSelectedFolder] = useState(MOCK_PRODUCTS[0].folders[0].id);

  const recentContent = getAllContent()
    .filter((c) => c.item.status === "analyzed")
    .sort((a, b) => new Date(b.item.ingested_at).getTime() - new Date(a.item.ingested_at).getTime())
    .slice(0, 5);

  const allContent = getAllContent();
  const criticalItems = allContent.filter((c) => {
    const a = CONTENT_ANALYSIS[c.item.id];
    return a?.gaps.some((g) => g.severity === "critical");
  });

  function handleIngest() {
    if (!ingestUrl) return;
    toast.success("Content ingested — analysis will complete shortly.");
    setIngestUrl("");
    setShowQuickIngest(false);
  }

  const product = MOCK_PRODUCTS.find((p) => p.id === selectedProduct);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Products</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Select a content item from the sidebar to analyze and optimize it
          </p>
        </div>
        <button
          onClick={() => setShowQuickIngest(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Upload className="h-4 w-4" /> Ingest Content
        </button>
      </div>

      {/* How it works — shown prominently */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <h2 className="font-semibold mb-3 text-sm">How GAEO works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            {
              step: "1",
              icon: Upload,
              title: "Ingest Content",
              desc: "Add your existing content — blog posts, docs, landing pages — by URL or file upload.",
            },
            {
              step: "2",
              icon: Sparkles,
              title: "AI Analysis",
              desc: "GAEO scores each piece of content across 7 AI visibility dimensions and identifies specific gaps.",
            },
            {
              step: "3",
              icon: File,
              title: "Generate & Edit",
              desc: "Generate an AI-enhanced version of your content with the right structure for LLM citation.",
            },
            {
              step: "4",
              icon: CheckCircle2,
              title: "Publish",
              desc: "Publish the improved content directly to your CMS and watch your AI visibility score climb.",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                  {s.step}
                </div>
                <div>
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    {s.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_PRODUCTS.map((product) => {
          const stats = getProductStats(product.id)!;
          const allItems = product.folders.flatMap((f) => f.items);
          const criticalCount = allItems.filter((i) => {
            const a = CONTENT_ANALYSIS[i.id];
            return a?.gaps.some((g) => g.severity === "critical");
          }).length;

          return (
            <div key={product.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Package2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                </div>
                {stats.avgScore !== null && (
                  <ScoreBadge score={stats.avgScore} />
                )}
              </div>

              {/* Folders */}
              <div className="space-y-2 mb-4">
                {product.folders.map((folder) => (
                  <div key={folder.id} className="flex items-center gap-2 text-sm">
                    <Folder className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{folder.name}</span>
                    <span className="text-xs bg-muted rounded px-1.5 py-0.5 ml-auto">
                      {folder.items.length} items
                    </span>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  {stats.analyzed}/{stats.total} analyzed
                </span>
                {criticalCount > 0 && (
                  <span className="flex items-center gap-1 text-red-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {criticalCount} critical gaps
                  </span>
                )}
                <span className="flex items-center gap-1 ml-auto">
                  <a
                    href={`https://${product.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-foreground hover:underline"
                  >
                    {product.url}
                  </a>
                </span>
              </div>
            </div>
          );
        })}

        {/* Add product card */}
        <button
          onClick={() => toast.success("Create product — coming soon!")}
          className="rounded-xl border border-dashed border-border p-5 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-accent/30 transition-all min-h-[160px]"
        >
          <div className="h-8 w-8 rounded-lg border-2 border-dashed border-current flex items-center justify-center">
            <Plus className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium">Add Product</p>
          <p className="text-xs text-center">Create a new product and start ingesting content</p>
        </button>
      </div>

      {/* Needs attention */}
      {criticalItems.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Needs Attention
              <span className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full font-medium">
                {criticalItems.length}
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Content with critical AI visibility gaps
            </p>
          </div>
          <div className="divide-y divide-border">
            {criticalItems.slice(0, 5).map(({ product, folder, item }) => {
              const analysis = CONTENT_ANALYSIS[item.id];
              const criticalGaps = analysis?.gaps.filter((g) => g.severity === "critical") ?? [];
              return (
                <Link
                  key={item.id}
                  to={`/dashboard/content/${item.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-accent/40 transition-colors group"
                >
                  <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.name} / {folder.name} ·{" "}
                      {criticalGaps.length} critical gap{criticalGaps.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ScoreBadge score={item.score} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent content */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Recently Analyzed
          </h2>
        </div>
        <div className="divide-y divide-border">
          {recentContent.map(({ product, folder, item }) => (
            <Link
              key={item.id}
              to={`/dashboard/content/${item.id}`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-accent/40 transition-colors group"
            >
              <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {product.name} / {folder.name} · <RelativeTime iso={item.ingested_at} />
                </p>
              </div>
              <ScoreBadge score={item.score} />
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Ingest Modal */}
      {showQuickIngest && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQuickIngest(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Upload className="h-4 w-4" /> Ingest Content
              </h2>
              <button onClick={() => setShowQuickIngest(false)}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Product
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    const p = MOCK_PRODUCTS.find((p) => p.id === e.target.value);
                    if (p) setSelectedFolder(p.folders[0].id);
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {MOCK_PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Folder
                </label>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {(product?.folders ?? []).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Page URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/blog/my-article"
                  value={ingestUrl}
                  onChange={(e) => setIngestUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleIngest()}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleIngest}
                disabled={!ingestUrl}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Ingest & Analyze
              </button>
              <button
                onClick={() => setShowQuickIngest(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
