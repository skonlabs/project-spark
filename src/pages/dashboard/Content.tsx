import { useState, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight, CheckCircle2, Clock, AlertCircle, FileText, Globe,
  Loader2, Upload, Link as LinkIcon, Github, Database, Cloud, BookOpen,
  Code2, Zap, ExternalLink, Filter, Search, ChevronDown, ArrowUpDown,
  FolderOpen, BarChart2, Sparkles, Send, List, FolderTree, Plus, Folder,
  ChevronRight, Package2, X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useContent } from "@/contexts/ContentContext";
// Analysis data now comes from useContent context
import { FolderPicker } from "@/components/dashboard/FolderPicker";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  analyzed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Analyzed", color: "text-green-400 bg-green-500/10" },
  pending: { icon: <Clock className="h-3.5 w-3.5" />, label: "Pending", color: "text-yellow-400 bg-yellow-500/10" },
  processing: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, label: "Processing", color: "text-blue-400 bg-blue-500/10" },
  error: { icon: <AlertCircle className="h-3.5 w-3.5" />, label: "Error", color: "text-red-400 bg-red-500/10" },
};

type IngestTab = "upload" | "url" | "crawl";
type SortKey = "title" | "score" | "status" | "ingested_at";
type FilterStatus = "all" | "analyzed" | "processing" | "pending" | "error";
type ViewMode = "list" | "explorer";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function titleFromUrl(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    const slug = u.pathname.split("/").filter(Boolean).pop() ?? u.hostname;
    return slug.replace(/[-_]/g, " ").replace(/\.\w+$/, "").replace(/\b\w/g, (c) => c.toUpperCase()) || u.hostname;
  } catch {
    return url.split("/").filter(Boolean).pop() ?? "Untitled";
  }
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[10px] text-muted-foreground font-mono">—</span>;
  const color = score >= 65 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : score >= 45 ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
    : "text-red-400 bg-red-500/10 border-red-500/20";
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tabular-nums font-mono ${color}`}>{score}</span>;
}

function scoreColor(score: number | null) {
  if (score === null) return "text-muted-foreground";
  if (score >= 65) return "text-emerald-400";
  if (score >= 45) return "text-yellow-400";
  return "text-red-400";
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ContentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { products, addContentItem, updateItemStatus, addFolder, getAnalysis } = useContent();

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Explorer state
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set(products.map(p => p.id)));
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(products.flatMap(p => p.folders.map(f => f.id))));

  // Create folder modal
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderProductId, setNewFolderProductId] = useState(products[0]?.id ?? "");

  // Ingest state
  const [showIngest, setShowIngest] = useState(false);
  const [activeTab, setActiveTab] = useState<IngestTab>("upload");
  const [urlInput, setUrlInput] = useState("");
  const [crawlUrl, setCrawlUrl] = useState("");
  const [crawlMaxPages, setCrawlMaxPages] = useState("50");

  // Target - check URL params for pre-selected folder
  const preselectedProductId = searchParams.get("product");
  const preselectedFolderId = searchParams.get("folder");
  
  const [selectedProductId, setSelectedProductId] = useState(preselectedProductId ?? (products[0]?.id ?? ""));
  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? products[0];
  const [selectedFolderId, setSelectedFolderId] = useState(preselectedFolderId ?? (selectedProduct?.folders[0]?.id ?? ""));
  const selectedFolder = selectedProduct?.folders.find((f) => f.id === selectedFolderId) ?? selectedProduct?.folders[0];

  // Library filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("ingested_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // ── Build flat content list ───────────────────────────────────────────────
  const allItems = useMemo(() =>
    products.flatMap((p) =>
      p.folders.flatMap((f) =>
        f.items.map((item) => ({
          ...item,
          productId: p.id,
          productName: p.name,
          folderId: f.id,
          folderName: f.name,
          hasGaps: getAnalysis(item.id)?.gaps.some((g) => g.severity === "critical") ?? false,
        }))
      )
    ), [products]);

  // ── Filter & sort ─────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    let items = allItems;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((i) => i.title.toLowerCase().includes(q) || i.productName.toLowerCase().includes(q) || i.folderName.toLowerCase().includes(q));
    }
    if (filterStatus !== "all") items = items.filter((i) => i.status === filterStatus);
    if (filterProduct !== "all") items = items.filter((i) => i.productId === filterProduct);
    items.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "score") cmp = (a.score ?? -1) - (b.score ?? -1);
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else cmp = new Date(a.ingested_at).getTime() - new Date(b.ingested_at).getTime();
      return sortAsc ? cmp : -cmp;
    });
    return items;
  }, [allItems, searchQuery, filterStatus, filterProduct, sortKey, sortAsc]);

  // ── Aggregates ────────────────────────────────────────────────────────────
  const totalItems = allItems.length;
  const analyzedCount = allItems.filter((i) => i.status === "analyzed").length;
  const processingCount = allItems.filter((i) => i.status === "processing").length;
  const criticalCount = allItems.filter((i) => i.hasGaps).length;
  const avgScore = Math.round(allItems.filter((i) => i.score !== null).reduce((s, i) => s + (i.score ?? 0), 0) / Math.max(1, allItems.filter((i) => i.score !== null).length));

  // ── Dropzone ──────────────────────────────────────────────────────────────
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
      "text/html": [".html"],
    },
    maxSize: 50 * 1024 * 1024,
  });

  // ── Toggle functions ──────────────────────────────────────────────────────
  function toggleProduct(id: string) {
    setExpandedProducts((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function toggleFolder(id: string) {
    setExpandedFolders((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  // ── Open ingest for specific folder ───────────────────────────────────────
  function openIngestForFolder(productId: string, folderId: string) {
    setSelectedProductId(productId);
    setSelectedFolderId(folderId);
    setShowIngest(true);
  }

  // ── Create folder handler ─────────────────────────────────────────────────
  async function handleCreateFolder() {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    if (!newFolderProductId) {
      toast.error("Please select a product first");
      return;
    }
    try {
      await addFolder(newFolderProductId, newFolderName.trim());
      toast.success(`Folder "${newFolderName}" created`);
      setNewFolderName("");
      setShowCreateFolder(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create folder");
    }
  }

  // ── Ingest handler ────────────────────────────────────────────────────────
  async function ingest(title: string, url: string, sourceType: "url" | "file" | "crawl") {
    if (!selectedProduct) { toast.error("Please create a product first."); return; }
    if (!selectedFolder) { toast.error("Please select a folder first."); return; }
    try {
      const itemId = await addContentItem({
        productId: selectedProduct.id, folderId: selectedFolder.id, title, url, source_type: sourceType,
      });
      return itemId;
    } catch (err: any) {
      toast.error(err.message || "Failed to ingest content");
    }
  }

  function handleBatchUpload() {
    if (acceptedFiles.length === 0) return;
    acceptedFiles.forEach((file) => {
      ingest(file.name.replace(/\.\w+$/, ""), "#", "file");
    });
    toast.success(`${acceptedFiles.length} file(s) ingesting — watch status in the table below`);
    setShowIngest(false);
  }

  function handleUrlIngest() {
    if (!urlInput) return;
    ingest(titleFromUrl(urlInput), urlInput, "url");
    toast.success(`"${titleFromUrl(urlInput)}" ingesting — watch status below`);
    setUrlInput("");
  }

  function handleCrawl() {
    if (!crawlUrl) return;
    const count = Math.min(parseInt(crawlMaxPages), 5);
    for (let i = 0; i < count; i++) {
      const page = `${crawlUrl}/page-${i + 1}`;
      ingest(`${titleFromUrl(crawlUrl)} Page ${i + 1}`, page, "crawl");
    }
    toast.success(`Crawling ${crawlUrl} — ${count} pages being ingested`);
    setCrawlUrl("");
    setShowIngest(false);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  function toggleSelect(id: string) {
    setSelectedItems((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  function toggleSelectAll() {
    if (selectedItems.size === filteredItems.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(filteredItems.map((i) => i.id)));
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Content Library</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            All your content in one place — ingest, track status, and manage your pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode("explorer")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${viewMode === "explorer" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <FolderTree className="h-3.5 w-3.5" /> Explorer
            </button>
          </div>
          <button onClick={() => setShowCreateFolder(true)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
            <Plus className="h-4 w-4" /> New Folder
          </button>
          <button onClick={() => setShowIngest(!showIngest)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Upload className="h-4 w-4" /> Ingest Content
          </button>
        </div>
      </div>

      {/* Aggregate stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Items", value: totalItems, icon: FileText },
          { label: "Analyzed", value: analyzedCount, icon: CheckCircle2, color: "text-green-400" },
          { label: "Processing", value: processingCount, icon: Loader2, color: "text-blue-400" },
          { label: "Avg Score", value: avgScore, icon: BarChart2, suffix: "/100" },
          { label: "Critical Gaps", value: criticalCount, icon: AlertCircle, color: "text-red-400" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-3 text-center">
              <Icon className={`h-4 w-4 mx-auto mb-1 ${stat.color ?? "text-muted-foreground/50"}`} />
              <p className="text-lg font-bold tabular-nums">{stat.value}{stat.suffix ?? ""}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Ingest panel — collapsible */}
      {showIngest && (
        <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-sm flex items-center gap-2"><Upload className="h-4 w-4 text-primary" /> Ingest New Content</h2>
            <button onClick={() => setShowIngest(false)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
          </div>

          {/* Parent folder picker */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Destination Folder</label>
            <FolderPicker
              products={products}
              selectedProductId={selectedProductId}
              selectedFolderId={selectedFolderId}
              onSelect={(pId, fId) => {
                setSelectedProductId(pId);
                setSelectedFolderId(fId ?? products.find(p => p.id === pId)?.folders[0]?.id ?? "");
              }}
              placeholder="Select destination folder..."
              className="max-w-sm"
            />
          </div>

          {/* Method tabs */}
          <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
            {([
              { id: "upload" as IngestTab, label: "File Upload", icon: <Upload className="h-3.5 w-3.5" /> },
              { id: "url" as IngestTab, label: "URL / Sitemap", icon: <LinkIcon className="h-3.5 w-3.5" /> },
              { id: "crawl" as IngestTab, label: "Web Crawl", icon: <Globe className="h-3.5 w-3.5" /> },
            ]).map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Upload */}
          {activeTab === "upload" && (
            <div className="space-y-3">
              <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="font-medium text-sm mb-1">Drop files here or click to select</p>
                <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, Markdown, HTML — up to 50MB each. <strong>Multiple files supported.</strong></p>
              </div>
              {acceptedFiles.length > 0 && (
                <div className="space-y-2">
                  {acceptedFiles.map((file) => (
                    <div key={file.name} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="flex-1 truncate text-xs">{file.name}</span>
                      <span className="text-muted-foreground text-[10px]">{(file.size / 1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                  <button onClick={handleBatchUpload} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground flex items-center justify-center gap-2">
                    <Upload className="h-4 w-4" /> Upload & Analyse {acceptedFiles.length} file(s)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* URL */}
          {activeTab === "url" && (
            <div className="flex gap-2">
              <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleUrlIngest(); }}
                placeholder="https://example.com/page or sitemap.xml" className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              <button disabled={!urlInput} onClick={handleUrlIngest} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">Ingest</button>
            </div>
          )}

          {/* Crawl */}
          {activeTab === "crawl" && (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <input value={crawlUrl} onChange={(e) => setCrawlUrl(e.target.value)} placeholder="https://example.com"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <select value={crawlMaxPages} onChange={(e) => setCrawlMaxPages(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
                {["10", "25", "50", "100"].map((v) => <option key={v} value={v}>{v} pages</option>)}
              </select>
              <button disabled={!crawlUrl} onClick={handleCrawl} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2">
                <Globe className="h-4 w-4" /> Crawl
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content view - List or Explorer */}
      {viewMode === "list" ? (
        /* List View */
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Table toolbar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search content..."
                className="bg-transparent text-sm focus:outline-none flex-1" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none">
              <option value="all">All Status</option>
              <option value="analyzed">Analyzed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="error">Error</option>
            </select>
            <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)}
              className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none">
              <option value="all">All Products</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <span className="text-xs text-muted-foreground tabular-nums">{filteredItems.length} items</span>
          </div>

          {/* Batch actions */}
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border-b border-primary/20">
              <span className="text-xs font-medium text-primary">{selectedItems.size} selected</span>
              <button onClick={() => { toast.success(`Analyzing ${selectedItems.size} items...`); setSelectedItems(new Set()); }}
                className="text-xs text-primary hover:underline flex items-center gap-1"><BarChart2 className="h-3 w-3" /> Analyze All</button>
              <button onClick={() => { toast.success(`Generating for ${selectedItems.size} items...`); setSelectedItems(new Set()); }}
                className="text-xs text-primary hover:underline flex items-center gap-1"><Sparkles className="h-3 w-3" /> Generate All</button>
              <button onClick={() => setSelectedItems(new Set())} className="text-xs text-muted-foreground hover:text-foreground ml-auto">Clear</button>
            </div>
          )}

          {/* Table header */}
          <div className="grid grid-cols-[32px_1fr_120px_80px_80px_100px_40px] gap-2 px-4 py-2 border-b border-border text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
            <div className="flex items-center">
              <input type="checkbox" checked={selectedItems.size === filteredItems.length && filteredItems.length > 0} onChange={toggleSelectAll} className="rounded" />
            </div>
            <button onClick={() => toggleSort("title")} className="flex items-center gap-1 hover:text-foreground text-left">
              Title <ArrowUpDown className="h-2.5 w-2.5" />
            </button>
            <span>Location</span>
            <button onClick={() => toggleSort("score")} className="flex items-center gap-1 hover:text-foreground">
              Score <ArrowUpDown className="h-2.5 w-2.5" />
            </button>
            <button onClick={() => toggleSort("status")} className="flex items-center gap-1 hover:text-foreground">
              Status <ArrowUpDown className="h-2.5 w-2.5" />
            </button>
            <span>Pipeline</span>
            <span></span>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground mb-2">No content found</p>
                <button onClick={() => setShowIngest(true)} className="text-xs text-primary hover:underline">Ingest your first content</button>
              </div>
            ) : (
              filteredItems.map((item) => {
                const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
                const isAnalyzed = item.status === "analyzed";
                return (
                  <div key={item.id} className={`grid grid-cols-[32px_1fr_120px_80px_80px_100px_40px] gap-2 px-4 py-2.5 hover:bg-accent/20 transition-colors items-center ${selectedItems.has(item.id) ? "bg-primary/5" : ""}`}>
                    <div>
                      <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => toggleSelect(item.id)} className="rounded" />
                    </div>
                    <button onClick={() => navigate(`/dashboard/content/${item.id}`)} className="text-left min-w-0">
                      <p className="text-sm font-medium truncate hover:text-primary transition-colors">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground/50 truncate">{item.url !== "#" ? item.url : item.source_type}</p>
                    </button>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                      <FolderOpen className="h-2.5 w-2.5 flex-shrink-0" />
                      <span className="truncate">{item.folderName}</span>
                    </div>
                    <div className="flex justify-center">
                      <ScoreBadge score={item.score} />
                    </div>
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {/* Mini pipeline indicator */}
                      <div className={`h-1.5 flex-1 rounded-full ${isAnalyzed ? "bg-green-400" : item.status === "processing" ? "bg-blue-400 animate-pulse" : "bg-muted"}`} title="Analyzed" />
                      <div className="h-1.5 flex-1 rounded-full bg-muted" title="Generated" />
                      <div className="h-1.5 flex-1 rounded-full bg-muted" title="Published" />
                    </div>
                    <div className="flex justify-center">
                      <button onClick={() => navigate(`/dashboard/content/${item.id}`)} className="text-muted-foreground/40 hover:text-primary transition-colors">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Explorer View */
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <FolderTree className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Explorer View</span>
            <span className="text-xs text-muted-foreground ml-auto">{allItems.length} items across {products.reduce((acc, p) => acc + p.folders.length, 0)} folders</span>
          </div>
          <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
            {products.map((product) => {
              const isProductExpanded = expandedProducts.has(product.id);
              const productItems = product.folders.flatMap(f => f.items);
              const analyzedProductCount = productItems.filter(i => i.status === "analyzed").length;
              
              return (
                <div key={product.id} className="space-y-1">
                  {/* Product row */}
                  <div className="flex items-center gap-2 group">
                    <button onClick={() => toggleProduct(product.id)} className="p-1 text-muted-foreground/50 hover:text-foreground transition-colors">
                      {isProductExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <Package2 className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-sm flex-1">{product.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{analyzedProductCount}/{productItems.length}</span>
                  </div>
                  
                  {/* Folders */}
                  {isProductExpanded && (
                    <div className="ml-6 space-y-1">
                      {product.folders.map((folder) => {
                        const isFolderExpanded = expandedFolders.has(folder.id);
                        const folderAnalyzed = folder.items.filter(i => i.status === "analyzed").length;
                        
                        return (
                          <div key={folder.id} className="space-y-0.5">
                            {/* Folder row */}
                            <div className="flex items-center gap-2 group">
                              <button onClick={() => toggleFolder(folder.id)} className="p-1 text-muted-foreground/50 hover:text-foreground transition-colors">
                                {isFolderExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                              </button>
                              {isFolderExpanded ? <FolderOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                              <span className="text-sm flex-1">{folder.name}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{folderAnalyzed}/{folder.items.length}</span>
                              <button
                                onClick={() => openIngestForFolder(product.id, folder.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-primary transition-all"
                                title="Add content to this folder"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            
                            {/* Items */}
                            {isFolderExpanded && (
                              <div className="ml-6 space-y-0.5">
                                {folder.items.map((item) => {
                                  const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
                                  const isAnalyzed = item.status === "analyzed";
                                  return (
                                    <button
                                      key={item.id}
                                      onClick={() => navigate(`/dashboard/content/${item.id}`)}
                                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-left hover:bg-accent/30 transition-colors group"
                                    >
                                      <FileText className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                                      <span className="text-sm flex-1 truncate group-hover:text-primary transition-colors">{item.title}</span>
                                      {/* Status */}
                                      <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${status.color}`}>
                                        {status.icon} <span className="hidden sm:inline">{status.label}</span>
                                      </span>
                                      {/* Score */}
                                      <ScoreBadge score={item.score} />
                                      {/* Pipeline */}
                                      <div className="flex items-center gap-0.5 w-16 flex-shrink-0">
                                        <div className={`h-1.5 flex-1 rounded-full ${isAnalyzed ? "bg-green-400" : item.status === "processing" ? "bg-blue-400 animate-pulse" : "bg-muted"}`} title="Analyzed" />
                                        <div className="h-1.5 flex-1 rounded-full bg-muted" title="Generated" />
                                        <div className="h-1.5 flex-1 rounded-full bg-muted" title="Published" />
                                      </div>
                                      <ArrowRight className="h-3 w-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                  );
                                })}
                                {/* Add content button */}
                                <button
                                  onClick={() => openIngestForFolder(product.id, folder.id)}
                                  className="flex items-center gap-2 w-full px-2 py-1 rounded-lg text-left hover:bg-accent/30 transition-colors text-muted-foreground/50 hover:text-muted-foreground"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span className="text-xs">Add content</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {/* Add folder button */}
                      <button
                        onClick={() => { setNewFolderProductId(product.id); setShowCreateFolder(true); }}
                        className="flex items-center gap-2 ml-6 px-2 py-1 rounded-lg text-left hover:bg-accent/30 transition-colors text-muted-foreground/50 hover:text-muted-foreground"
                      >
                        <Plus className="h-3 w-3" />
                        <span className="text-xs">New folder</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Next step hint */}
      <div className="rounded-xl border border-border bg-card/50 p-4 flex items-center gap-4 flex-wrap">
        <p className="text-xs text-muted-foreground flex-1">
          <strong className="text-foreground">Next step:</strong> Click any content item to open its pipeline — Analyze → Generate → Edit → Publish. 
          Or use the aggregate views:
        </p>
        <Link to="/dashboard/analysis" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
          <BarChart2 className="h-3 w-3" /> Gap Analysis
        </Link>
        <Link to="/dashboard/content/generate" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
          <Sparkles className="h-3 w-3" /> Generate Queue
        </Link>
        <Link to="/dashboard/publish" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
          <Send className="h-3 w-3" /> Publish Queue
        </Link>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateFolder(false)}>
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-sm flex items-center gap-2">
                <Folder className="h-4 w-4" /> Create New Folder
              </h2>
              <button onClick={() => setShowCreateFolder(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Parent Location</label>
                <FolderPicker
                  products={products}
                  selectedProductId={newFolderProductId}
                  selectedFolderId={null}
                  onSelect={(pId) => setNewFolderProductId(pId)}
                  allowProductRoot
                  placeholder="Select parent product or folder..."
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Folder Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); }}
                  placeholder="e.g., Case Studies"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-5">
              <button onClick={handleCreateFolder} disabled={!newFolderName.trim()} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
                Create Folder
              </button>
              <button onClick={() => setShowCreateFolder(false)} className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
