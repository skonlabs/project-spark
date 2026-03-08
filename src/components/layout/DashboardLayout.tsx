import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  LogOut,
  Package2,
  Plus,
  Settings,
  Swords,
  Upload,
  User,
  X,
  Globe,
  FileUp,
  MessageSquare,
  BarChart2,
} from "lucide-react";
import toast from "react-hot-toast";
import { MOCK_PRODUCTS } from "@/data/products";

type IngestMethod = "url" | "file";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ full_name: string; email: string } | null>(null);

  // Explorer state
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set(["product-gaeo"])
  );
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["folder-blog", "folder-docs", "folder-landing"])
  );

  // Ingest modal state
  const [showIngest, setShowIngest] = useState(false);
  const [ingestTarget, setIngestTarget] = useState<{ productName: string; folderName: string } | null>(null);
  const [ingestMethod, setIngestMethod] = useState<IngestMethod>("url");
  const [ingestUrl, setIngestUrl] = useState("");
  const [ingestLoading, setIngestLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/auth/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  function toggleProduct(id: string) {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleFolder(id: string) {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openIngest(productName: string, folderName: string) {
    setIngestTarget({ productName, folderName });
    setIngestUrl("");
    setIngestMethod("url");
    setShowIngest(true);
  }

  function handleIngest() {
    if (!ingestUrl && ingestMethod === "url") return;
    setIngestLoading(true);
    setTimeout(() => {
      setIngestLoading(false);
      setShowIngest(false);
      toast.success(`Content ingested into ${ingestTarget?.folderName} — analysis will complete shortly.`);
    }, 1500);
  }

  function handleLogout() {
    localStorage.clear();
    navigate("/auth/login");
  }

  const isContentSelected = (id: string) =>
    location.pathname === `/dashboard/content/${id}`;
  const isRouteActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  function scoreColor(score: number | null) {
    if (score === null) return "text-muted-foreground";
    if (score >= 65) return "text-green-400";
    if (score >= 45) return "text-yellow-400";
    return "text-red-400";
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card flex flex-col overflow-hidden">
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-border flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">G</span>
            </div>
            <span className="font-bold text-base tracking-tight">GAEO</span>
          </Link>
        </div>

        {/* Explorer */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-3 py-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Explorer
            </span>
            <button
              onClick={() => toast.success("Add product — coming soon!")}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Add Product"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {MOCK_PRODUCTS.map((product) => {
            const isExpanded = expandedProducts.has(product.id);
            const allItems = product.folders.flatMap((f) => f.items);
            const analyzedCount = allItems.filter((i) => i.status === "analyzed").length;

            return (
              <div key={product.id}>
                {/* Product row */}
                <div className="flex items-center mx-1">
                  <button
                    onClick={() => toggleProduct(product.id)}
                    className="p-1 text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 flex-1 px-1 py-1.5 rounded-md hover:bg-accent/60 transition-colors text-sm font-medium truncate"
                  >
                    <Package2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <span className="truncate">{product.name}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground flex-shrink-0">
                      {analyzedCount}/{allItems.length}
                    </span>
                  </Link>
                </div>

                {/* Folders */}
                {isExpanded && (
                  <div className="ml-5">
                    {product.folders.map((folder) => {
                      const isFolderOpen = expandedFolders.has(folder.id);
                      return (
                        <div key={folder.id}>
                          {/* Folder row */}
                          <button
                            onClick={() => toggleFolder(folder.id)}
                            className="flex items-center gap-1.5 w-full px-2 py-1 rounded-md hover:bg-accent/60 transition-colors text-sm text-left"
                          >
                            {isFolderOpen ? (
                              <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            )}
                            {isFolderOpen ? (
                              <FolderOpen className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                            ) : (
                              <Folder className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                            )}
                            <span className="truncate text-sm">{folder.name}</span>
                            <span className="ml-auto text-[10px] text-muted-foreground flex-shrink-0">
                              {folder.items.length}
                            </span>
                          </button>

                          {/* Content items */}
                          {isFolderOpen && (
                            <div className="ml-5">
                              {folder.items.map((item) => {
                                const selected = isContentSelected(item.id);
                                return (
                                  <Link
                                    key={item.id}
                                    to={`/dashboard/content/${item.id}`}
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors group ${
                                      selected
                                        ? "bg-primary/15 text-primary font-medium"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                                    }`}
                                  >
                                    <File className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate flex-1">{item.title}</span>
                                    {item.status === "processing" ? (
                                      <span className="text-[9px] text-yellow-400 flex-shrink-0">●</span>
                                    ) : item.score !== null ? (
                                      <span
                                        className={`text-[10px] font-semibold flex-shrink-0 ${scoreColor(item.score)}`}
                                      >
                                        {item.score}
                                      </span>
                                    ) : null}
                                  </Link>
                                );
                              })}

                              {/* Ingest button */}
                              <button
                                onClick={() => openIngest(product.name, folder.name)}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors w-full mt-0.5"
                              >
                                <Plus className="h-3 w-3 flex-shrink-0" />
                                <span>Ingest content</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer nav */}
        <div className="border-t border-border py-2 px-2 space-y-0.5 flex-shrink-0">
          <Link
            to="/dashboard/content"
            className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
              isRouteActive("/dashboard/content")
                ? "bg-accent text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
            }`}
          >
            <Upload className="h-4 w-4" />
            Content Ingestion
          </Link>
          <Link
            to="/dashboard/prompts"
            className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
              isRouteActive("/dashboard/prompts")
                ? "bg-accent text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Prompts
          </Link>
          <Link
            to="/dashboard/analysis"
            className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
              isRouteActive("/dashboard/analysis")
                ? "bg-accent text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
            }`}
          >
            <BarChart2 className="h-4 w-4" />
            Gap Analysis
          </Link>
          <Link
            to="/dashboard/competitive"
            className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
              isRouteActive("/dashboard/competitive")
                ? "bg-accent text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
            }`}
          >
            <Swords className="h-4 w-4" />
            Competitive Analysis
          </Link>
          <Link
            to="/dashboard/settings"
            className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
              isRouteActive("/dashboard/settings")
                ? "bg-accent text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>

          {/* User */}
          <div className="flex items-center gap-2 px-2 py-2 mt-1">
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.full_name || "User"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <Outlet />
      </main>

      {/* ── Ingest Modal ─────────────────────────────────────────────────── */}
      {showIngest && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowIngest(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold flex items-center gap-2">
                <Upload className="h-4 w-4" /> Ingest Content
              </h2>
              <button
                onClick={() => setShowIngest(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {ingestTarget && (
              <p className="text-xs text-muted-foreground mb-4">
                Adding to{" "}
                <span className="text-foreground font-medium">{ingestTarget.productName}</span>
                {" → "}
                <span className="text-foreground font-medium">{ingestTarget.folderName}</span>
              </p>
            )}

            {/* Method tabs */}
            <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 mb-4">
              {[
                { id: "url", label: "URL", icon: Globe },
                { id: "file", label: "File Upload", icon: FileUp },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setIngestMethod(m.id as IngestMethod)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
                      ingestMethod === m.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {m.label}
                  </button>
                );
              })}
            </div>

            {ingestMethod === "url" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Page URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/blog/my-article"
                    value={ingestUrl}
                    onChange={(e) => setIngestUrl(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleIngest()}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    GAEO will fetch, parse, and analyze this page automatically.
                  </p>
                </div>
              </div>
            )}

            {ingestMethod === "file" && (
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                <FileUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium mb-1">Drop files here</p>
                <p className="text-xs text-muted-foreground mb-3">
                  PDF, DOCX, MD, TXT supported
                </p>
                <input
                  type="file"
                  accept=".pdf,.docx,.md,.txt"
                  className="hidden"
                  id="file-upload"
                  onChange={() => {
                    toast.success("File selected — click Ingest to process");
                    setIngestUrl("file-selected");
                  }}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent transition-colors"
                >
                  <FileUp className="h-3.5 w-3.5" /> Browse Files
                </label>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleIngest}
                disabled={(!ingestUrl && ingestMethod === "url") || ingestLoading}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {ingestLoading ? "Ingesting..." : "Ingest & Analyze"}
              </button>
              <button
                onClick={() => setShowIngest(false)}
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
