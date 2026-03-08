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
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useContent } from "@/contexts/ContentContext";

type IngestMethod = "url" | "file";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { products, addContentItem, updateItemStatus } = useContent();
  const [user, setUser] = useState<{ full_name: string; email: string } | null>(null);

  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set(["product-gaeo"]));
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["folder-blog", "folder-docs", "folder-landing"]));

  const [showIngest, setShowIngest] = useState(false);
  const [ingestTarget, setIngestTarget] = useState<{ productId: string; folderId: string; productName: string; folderName: string } | null>(null);
  const [ingestMethod, setIngestMethod] = useState<IngestMethod>("url");
  const [ingestUrl, setIngestUrl] = useState("");
  const [ingestLoading, setIngestLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { navigate("/auth/login"); return; }
    setUser(JSON.parse(userData));
  }, [navigate]);

  function toggleProduct(id: string) {
    setExpandedProducts((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  function toggleFolder(id: string) {
    setExpandedFolders((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  function openIngest(productId: string, folderId: string, productName: string, folderName: string) {
    setIngestTarget({ productId, folderId, productName, folderName });
    setIngestUrl(""); setIngestMethod("url"); setShowIngest(true);
  }

  function handleIngest() {
    if (!ingestTarget) return;
    if (!ingestUrl && ingestMethod === "url") return;
    setIngestLoading(true);
    setTimeout(() => {
      const title = ingestMethod === "url"
        ? (ingestUrl.split("/").filter(Boolean).pop() ?? "Untitled").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "Uploaded Document";
      const itemId = addContentItem({ productId: ingestTarget.productId, folderId: ingestTarget.folderId, title, url: ingestMethod === "url" ? ingestUrl : "#", source_type: ingestMethod === "url" ? "url" : "file" });
      setTimeout(() => { updateItemStatus(itemId, "analyzed", Math.floor(Math.random() * 35) + 35); }, 3000);
      setIngestLoading(false); setShowIngest(false);
      toast.success(`"${title}" added to ${ingestTarget.folderName} — analysing now…`);
      navigate(`/dashboard/content/${itemId}`);
    }, 1200);
  }

  function handleLogout() { localStorage.clear(); navigate("/auth/login"); }

  const isContentSelected = (id: string) => location.pathname === `/dashboard/content/${id}`;
  const isRouteActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  function scoreColor(score: number | null) {
    if (score === null) return "text-muted-foreground";
    if (score >= 65) return "text-emerald-400";
    if (score >= 45) return "text-yellow-400";
    return "text-red-400";
  }

  const navLinks = [
    { to: "/dashboard/content", icon: Upload, label: "Content Ingestion" },
    { to: "/dashboard/prompts", icon: MessageSquare, label: "Prompts" },
    { to: "/dashboard/analysis", icon: BarChart2, label: "Gap Analysis" },
    { to: "/dashboard/competitive", icon: Swords, label: "Competitive" },
    { to: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border/60 bg-sidebar flex flex-col overflow-hidden">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-sidebar-border flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md shadow-primary/20">
              <span className="text-white font-black text-xs">G</span>
            </div>
            <span className="font-extrabold text-base tracking-tight">GAEO</span>
          </Link>
        </div>

        {/* Explorer */}
        <div className="flex-1 overflow-y-auto py-3">
          <div className="px-4 py-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Explorer</span>
            <button onClick={() => toast.success("Add product — coming soon!")} className="text-muted-foreground hover:text-foreground transition-colors" title="Add Product">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {products.map((product) => {
            const isExpanded = expandedProducts.has(product.id);
            const allItems = product.folders.flatMap((f) => f.items);
            const analyzedCount = allItems.filter((i) => i.status === "analyzed").length;

            return (
              <div key={product.id}>
                <div className="flex items-center mx-1.5">
                  <button onClick={() => toggleProduct(product.id)} className="p-1 text-muted-foreground hover:text-foreground flex-shrink-0">
                    {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                  <Link to="/dashboard" className="flex items-center gap-1.5 flex-1 px-1.5 py-1.5 rounded-lg hover:bg-sidebar-accent/60 transition-colors text-sm font-semibold truncate">
                    <Package2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <span className="truncate">{product.name}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground flex-shrink-0 tabular-nums">{analyzedCount}/{allItems.length}</span>
                  </Link>
                </div>

                {isExpanded && (
                  <div className="ml-5">
                    {product.folders.map((folder) => {
                      const isFolderOpen = expandedFolders.has(folder.id);
                      return (
                        <div key={folder.id}>
                          <button onClick={() => toggleFolder(folder.id)} className="flex items-center gap-1.5 w-full px-2 py-1 rounded-lg hover:bg-sidebar-accent/60 transition-colors text-sm text-left">
                            {isFolderOpen ? <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                            {isFolderOpen ? <FolderOpen className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" /> : <Folder className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />}
                            <span className="truncate text-sm">{folder.name}</span>
                            <span className="ml-auto text-[10px] text-muted-foreground flex-shrink-0">{folder.items.length}</span>
                          </button>

                          {isFolderOpen && (
                            <div className="ml-5">
                              {folder.items.map((item) => {
                                const selected = isContentSelected(item.id);
                                return (
                                  <Link key={item.id} to={`/dashboard/content/${item.id}`}
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all group ${
                                      selected ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60"
                                    }`}
                                  >
                                    <File className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate flex-1">{item.title}</span>
                                    {item.status === "processing" ? (
                                      <span className="text-[9px] text-yellow-400 flex-shrink-0 animate-pulse">●</span>
                                    ) : item.score !== null ? (
                                      <span className={`text-[10px] font-bold flex-shrink-0 tabular-nums ${scoreColor(item.score)}`}>{item.score}</span>
                                    ) : null}
                                  </Link>
                                );
                              })}
                              <button onClick={() => openIngest(product.id, folder.id, product.name, folder.name)}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60 transition-colors w-full mt-0.5"
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
        <div className="border-t border-sidebar-border py-2.5 px-2.5 space-y-0.5 flex-shrink-0">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isRouteActive(link.to);
            return (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                  active ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}

          {/* User */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 mt-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 border border-border/60">
              <User className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user?.full_name || "User"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground flex-shrink-0 transition-colors" title="Sign out">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-w-0 bg-background">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Ingest Modal */}
      <AnimatePresence>
        {showIngest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowIngest(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border/60 rounded-2xl p-6 w-full max-w-md shadow-2xl gradient-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold flex items-center gap-2"><Upload className="h-4 w-4" /> Ingest Content</h2>
                <button onClick={() => setShowIngest(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              {ingestTarget && (
                <p className="text-xs text-muted-foreground mb-5">
                  Adding to <span className="text-foreground font-semibold">{ingestTarget.productName}</span> → <span className="text-foreground font-semibold">{ingestTarget.folderName}</span>
                </p>
              )}

              <div className="tab-bar mb-5">
                {[
                  { id: "url", label: "URL", icon: Globe },
                  { id: "file", label: "File Upload", icon: FileUp },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button key={m.id} onClick={() => setIngestMethod(m.id as IngestMethod)} data-active={ingestMethod === m.id ? "true" : "false"}
                      className="flex-1 flex items-center justify-center gap-1.5"
                    >
                      <Icon className="h-3 w-3" /> {m.label}
                    </button>
                  );
                })}
              </div>

              {ingestMethod === "url" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Page URL</label>
                    <input type="url" placeholder="https://example.com/blog/my-article" value={ingestUrl} onChange={(e) => setIngestUrl(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                      autoFocus onKeyDown={(e) => e.key === "Enter" && handleIngest()}
                    />
                    <p className="text-[11px] text-muted-foreground mt-1.5">GAEO will fetch, parse, and analyze this page automatically.</p>
                  </div>
                </div>
              )}

              {ingestMethod === "file" && (
                <div className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
                  <FileUp className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm font-medium">Drop files here or click to select</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, Markdown — up to 50MB</p>
                </div>
              )}

              <div className="flex gap-2 mt-5">
                <button onClick={handleIngest} disabled={(!ingestUrl && ingestMethod === "url") || ingestLoading}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-primary/20"
                >
                  {ingestLoading ? "Ingesting..." : "Ingest & Analyze"}
                </button>
                <button onClick={() => setShowIngest(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm hover:bg-accent transition-colors">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
