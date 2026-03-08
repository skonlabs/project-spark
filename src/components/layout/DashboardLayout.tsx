import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart2, Bot, ChevronDown, ChevronRight, File, Folder, FolderOpen,
  Globe, LayoutDashboard, LineChart, LogOut, Menu, MessageSquare,
  Package2, Plus, Send, Settings, Swords, Upload, User, X, Zap,
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    if (!ingestTarget || (!ingestUrl && ingestMethod === "url")) return;
    setIngestLoading(true);
    setTimeout(() => {
      const title = ingestMethod === "url"
        ? (ingestUrl.split("/").filter(Boolean).pop() ?? "Untitled").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "Uploaded Document";
      const itemId = addContentItem({ productId: ingestTarget.productId, folderId: ingestTarget.folderId, title, url: ingestMethod === "url" ? ingestUrl : "#", source_type: ingestMethod === "url" ? "url" : "file" });
      setTimeout(() => updateItemStatus(itemId, "analyzed", Math.floor(Math.random() * 35) + 35), 3000);
      setIngestLoading(false); setShowIngest(false);
      toast.success(`"${title}" added — analysing now…`);
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

  const navSections = [
    {
      label: "Core",
      links: [
        { to: "/dashboard", icon: LayoutDashboard, label: "Home", exact: true },
        { to: "/dashboard/overview", icon: BarChart2, label: "Overview" },
        { to: "/dashboard/content", icon: Upload, label: "Content" },
        { to: "/dashboard/analysis", icon: BarChart2, label: "Analysis" },
      ],
    },
    {
      label: "Intelligence",
      links: [
        { to: "/dashboard/prompts", icon: MessageSquare, label: "Prompts" },
        { to: "/dashboard/simulation", icon: Zap, label: "Simulation" },
        { to: "/dashboard/competitive", icon: Swords, label: "Competitive" },
        { to: "/dashboard/monitoring", icon: LineChart, label: "Monitoring" },
      ],
    },
    {
      label: "Manage",
      links: [
        { to: "/dashboard/topics", icon: Globe, label: "Topics" },
        { to: "/dashboard/agent", icon: Bot, label: "AI Agent" },
        { to: "/dashboard/content/generate", icon: Zap, label: "Generate" },
        { to: "/dashboard/publish", icon: Send, label: "Publish" },
        { to: "/dashboard/projects", icon: Package2, label: "Projects" },
        { to: "/dashboard/settings", icon: Settings, label: "Settings" },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className={`${sidebarOpen ? "w-56" : "w-0 overflow-hidden"} flex-shrink-0 border-r border-sidebar-border flex flex-col transition-all duration-200 bg-[hsl(var(--sidebar-background))]`}>
        {/* Logo */}
        <div className="h-12 flex items-center gap-2 px-4 border-b border-sidebar-border flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-[9px]">G</span>
            </div>
            <span className="font-heading font-bold text-sm tracking-tight">GAEO</span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40 px-2.5 mb-1.5">{section.label}</p>
              <div className="space-y-0.5">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const active = link.exact ? location.pathname === link.to : isRouteActive(link.to);
                  return (
                    <Link key={link.to} to={link.to}
                      className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-colors ${
                        active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground/70 hover:text-foreground hover:bg-accent/40"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Explorer */}
          <div>
            <div className="flex items-center justify-between px-2.5 mb-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40">Explorer</p>
              <button onClick={() => toast.success("Add product — coming soon!")} className="text-muted-foreground/30 hover:text-foreground transition-colors">
                <Plus className="h-3 w-3" />
              </button>
            </div>
            {products.map((product) => {
              const isExpanded = expandedProducts.has(product.id);
              const allItems = product.folders.flatMap((f) => f.items);
              const analyzedCount = allItems.filter((i) => i.status === "analyzed").length;
              return (
                <div key={product.id}>
                  <div className="flex items-center">
                    <button onClick={() => toggleProduct(product.id)} className="p-1 text-muted-foreground/30 hover:text-foreground flex-shrink-0">
                      {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </button>
                    <Link to="/dashboard" className="flex items-center gap-1.5 flex-1 px-1 py-1 rounded-md hover:bg-accent/30 transition-colors text-[13px] font-medium truncate text-muted-foreground/70 hover:text-foreground">
                      <Package2 className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="truncate">{product.name}</span>
                      <span className="ml-auto text-[9px] text-muted-foreground/30 font-mono">{analyzedCount}/{allItems.length}</span>
                    </Link>
                  </div>
                  {isExpanded && (
                    <div className="ml-4">
                      {product.folders.map((folder) => {
                        const isFolderOpen = expandedFolders.has(folder.id);
                        return (
                          <div key={folder.id}>
                            <button onClick={() => toggleFolder(folder.id)} className="flex items-center gap-1.5 w-full px-1.5 py-1 rounded-md hover:bg-accent/30 transition-colors text-[12px] text-left text-muted-foreground/60">
                              {isFolderOpen ? <ChevronDown className="h-2.5 w-2.5 flex-shrink-0" /> : <ChevronRight className="h-2.5 w-2.5 flex-shrink-0" />}
                              {isFolderOpen ? <FolderOpen className="h-3 w-3 flex-shrink-0" /> : <Folder className="h-3 w-3 flex-shrink-0" />}
                              <span className="truncate">{folder.name}</span>
                              <span className="ml-auto text-[9px] text-muted-foreground/20 font-mono">{folder.items.length}</span>
                            </button>
                            {isFolderOpen && (
                              <div className="ml-3.5">
                                {folder.items.map((item) => {
                                  const selected = isContentSelected(item.id);
                                  return (
                                    <Link key={item.id} to={`/dashboard/content/${item.id}`}
                                      className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-[11px] transition-all ${
                                        selected ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground/50 hover:text-foreground hover:bg-accent/20"
                                      }`}
                                    >
                                      <File className="h-2.5 w-2.5 flex-shrink-0" />
                                      <span className="truncate flex-1">{item.title}</span>
                                      {item.status === "processing" ? (
                                        <span className="text-[8px] text-warning animate-pulse">●</span>
                                      ) : item.score !== null ? (
                                        <span className={`text-[9px] font-bold tabular-nums font-mono ${scoreColor(item.score)}`}>{item.score}</span>
                                      ) : null}
                                    </Link>
                                  );
                                })}
                                <Link to={`/dashboard/content?product=${product.id}&folder=${folder.id}`}
                                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] text-muted-foreground/20 hover:text-muted-foreground hover:bg-accent/20 transition-colors w-full mt-0.5"
                                >
                                  <Plus className="h-2 w-2" /> Add
                                </Link>
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
        </div>

        {/* User footer */}
        <div className="border-t border-sidebar-border p-2.5 flex-shrink-0">
          <div className="flex items-center gap-2 px-1.5 py-1.5">
            <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0 border border-border">
              <User className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium truncate">{user?.full_name || "User"}</p>
              <p className="text-[9px] text-muted-foreground/40 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-muted-foreground/30 hover:text-foreground flex-shrink-0 transition-colors" title="Sign out">
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto min-w-0 bg-background">
        <div className="h-11 border-b border-border flex items-center px-4 flex-shrink-0 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground transition-colors mr-3">
            <Menu className="h-4 w-4" />
          </button>
          <div className="text-[11px] text-muted-foreground/50 font-mono">
            {location.pathname.replace("/dashboard", "").replace(/\//g, " / ").trim() || "home"}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Ingest Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showIngest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowIngest(false)}
          >
            <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }} transition={{ duration: 0.15 }}
              className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-heading font-bold text-sm flex items-center gap-2"><Upload className="h-4 w-4" /> Ingest Content</h2>
                <button onClick={() => setShowIngest(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              {ingestTarget && (
                <p className="text-xs text-muted-foreground mb-5">
                  Into <span className="text-foreground font-medium">{ingestTarget.productName}</span> → <span className="text-foreground font-medium">{ingestTarget.folderName}</span>
                </p>
              )}
              <div className="tab-bar mb-5">
                {(["url", "file"] as IngestMethod[]).map((m) => (
                  <button key={m} onClick={() => setIngestMethod(m)} data-active={ingestMethod === m ? "true" : "false"} className="flex-1 capitalize">
                    {m === "url" ? "URL" : "File"}
                  </button>
                ))}
              </div>
              {ingestMethod === "url" ? (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Page URL</label>
                  <input type="url" placeholder="https://example.com/blog/article" value={ingestUrl} onChange={(e) => setIngestUrl(e.target.value)}
                    className="input-field" autoFocus onKeyDown={(e) => e.key === "Enter" && handleIngest()} />
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-sm font-medium">Drop files here</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, MD — up to 50MB</p>
                </div>
              )}
              <div className="flex gap-2 mt-5">
                <button onClick={handleIngest} disabled={(!ingestUrl && ingestMethod === "url") || ingestLoading} className="btn-primary flex-1 justify-center py-2.5 text-sm">
                  {ingestLoading ? "Ingesting..." : "Ingest & Analyze"}
                </button>
                <button onClick={() => setShowIngest(false)} className="btn-secondary px-4 py-2.5 text-sm">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
