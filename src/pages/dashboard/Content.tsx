import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import {
  FileText, Globe, Loader2, Upload, Link as LinkIcon,
  CheckCircle2, Clock, AlertCircle, Github, Database,
  Cloud, BookOpen, Code2, Zap, ExternalLink, FolderPlus, X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useContent } from "@/contexts/ContentContext";
import {
  extractFileContent,
  fetchUrlContent,
  fetchGitHubRepo,
  simulateGitRepoIngest,
  simulateCloudIngest,
  simulateCmsIngest,
  fetchApiContent,
} from "@/lib/ingest";

const statusIcon: Record<string, React.ReactNode> = {
  analyzed: <CheckCircle2 className="h-4 w-4 text-green-400" />,
  pending: <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />,
  processing: <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />,
  error: <AlertCircle className="h-4 w-4 text-red-400" />,
};

type IngestTab = "upload" | "url" | "crawl" | "git" | "cloud" | "cms" | "api";

interface IngestingItem {
  id: string;
  title: string;
  stage: "fetching" | "parsing" | "analyzing" | "done" | "error";
  stageLabel: string;
}

const CMS_OPTIONS = [
  { id: "wordpress", name: "WordPress", description: "Connect to a WordPress site via REST API" },
  { id: "webflow", name: "Webflow", description: "Import from a Webflow CMS collection" },
  { id: "contentful", name: "Contentful", description: "Pull content entries from Contentful space" },
  { id: "ghost", name: "Ghost", description: "Import posts from a Ghost publication" },
  { id: "notion", name: "Notion", description: "Sync pages from a Notion workspace" },
  { id: "confluence", name: "Confluence", description: "Import pages from a Confluence space" },
];

const CLOUD_OPTIONS = [
  { id: "gdrive", name: "Google Drive", icon: "📂" },
  { id: "dropbox", name: "Dropbox", icon: "📦" },
  { id: "onedrive", name: "OneDrive", icon: "☁️" },
];

const GIT_OPTIONS = [
  { id: "github", name: "GitHub", placeholder: "https://github.com/owner/repo" },
  { id: "gitlab", name: "GitLab", placeholder: "https://gitlab.com/owner/repo" },
  { id: "bitbucket", name: "Bitbucket", placeholder: "https://bitbucket.org/owner/repo" },
];

function titleFromUrl(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    const slug = u.pathname.split("/").filter(Boolean).pop() ?? u.hostname;
    return slug.replace(/[-_]/g, " ").replace(/\.\w+$/, "").replace(/\b\w/g, (c) => c.toUpperCase()) || u.hostname;
  } catch {
    return url.split("/").filter(Boolean).pop() ?? "Untitled";
  }
}

const NEW_FOLDER_SENTINEL = "__new__";

export default function ContentPage() {
  const navigate = useNavigate();
  const { products, addContentItem, finalizeIngestion, markIngestionError, addFolder } = useContent();

  const [activeTab, setActiveTab] = useState<IngestTab>("upload");
  const [urlInput, setUrlInput] = useState("");
  const [crawlUrl, setCrawlUrl] = useState("");
  const [crawlMaxPages, setCrawlMaxPages] = useState("50");
  const [gitPlatform, setGitPlatform] = useState("github");
  const [gitUrl, setGitUrl] = useState("");
  const [cloudProvider, setCloudProvider] = useState("gdrive");
  const [selectedCms, setSelectedCms] = useState("wordpress");
  const [cmsUrl, setCmsUrl] = useState("");
  const [cmsApiKey, setCmsApiKey] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");

  // Active ingestion jobs (for progress UI)
  const [ingestingItems, setIngestingItems] = useState<IngestingItem[]>([]);

  const defaultProduct = products[0];
  const [selectedProductId, setSelectedProductId] = useState(defaultProduct?.id ?? "");
  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? products[0];
  const [selectedFolderId, setSelectedFolderId] = useState(selectedProduct?.folders[0]?.id ?? "");

  // Folder creation state
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const selectedFolder = selectedProduct?.folders.find((f) => f.id === selectedFolderId) ?? selectedProduct?.folders[0];

  const allItems = products.flatMap((p) =>
    p.folders.flatMap((f) =>
      f.items.map((item) => ({ ...item, productName: p.name, folderName: f.name }))
    )
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
      "text/html": [".html"],
      "text/csv": [".csv"],
      "application/json": [".json"],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const selectedGitOption = GIT_OPTIONS.find((g) => g.id === gitPlatform)!;

  function handleCreateFolder() {
    const name = newFolderName.trim();
    if (!name || !selectedProduct) return;
    const folderId = addFolder(selectedProduct.id, name);
    setSelectedFolderId(folderId);
    setNewFolderName("");
    setShowNewFolderInput(false);
    toast.success(`Folder "${name}" created`);
  }

  function updateIngestingItem(id: string, updates: Partial<IngestingItem>) {
    setIngestingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }

  function removeIngestingItem(id: string) {
    setTimeout(() => {
      setIngestingItems((prev) => prev.filter((item) => item.id !== id));
    }, 3000);
  }

  /**
   * Core async ingestion runner. Creates a content item immediately (processing state),
   * then runs the fetcher, finalizes with real content or marks error.
   */
  const runIngest = useCallback(
    async (
      title: string,
      url: string,
      sourceType: "url" | "file" | "crawl" | "api" | "cms",
      fetcher: () => Promise<{ title: string; content: string; wordCount: number }>
    ) => {
      if (!selectedProduct || !selectedFolder) {
        toast.error("Select a product and folder first.");
        return;
      }

      const itemId = addContentItem({
        productId: selectedProduct.id,
        folderId: selectedFolder.id,
        title,
        url,
        source_type: sourceType,
      });

      const ingestItem: IngestingItem = {
        id: itemId,
        title,
        stage: "fetching",
        stageLabel: "Fetching content…",
      };
      setIngestingItems((prev) => [ingestItem, ...prev]);

      try {
        updateIngestingItem(itemId, { stage: "fetching", stageLabel: "Fetching content…" });

        const result = await fetcher();

        updateIngestingItem(itemId, { stage: "parsing", stageLabel: "Parsing & cleaning…" });
        // Small delay to show parsing stage
        await new Promise((r) => setTimeout(r, 400));

        updateIngestingItem(itemId, { stage: "analyzing", stageLabel: "Running quality analysis…" });
        // Small delay to show analysis stage
        await new Promise((r) => setTimeout(r, 600));

        finalizeIngestion(itemId, result.content, result.wordCount, result.title || title);
        updateIngestingItem(itemId, { stage: "done", stageLabel: "Done!", title: result.title || title });

        toast.success(`"${result.title || title}" analysed and ready`);
        removeIngestingItem(itemId);
        navigate(`/dashboard/content/${itemId}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        markIngestionError(itemId);
        updateIngestingItem(itemId, { stage: "error", stageLabel: `Error: ${message}` });
        toast.error(`Failed to ingest "${title}": ${message}`);
        removeIngestingItem(itemId);
      }
    },
    [selectedProduct, selectedFolder, addContentItem, finalizeIngestion, markIngestionError, navigate]
  );

  const tabs: { id: IngestTab; label: string; icon: React.ReactNode }[] = [
    { id: "upload", label: "File Upload", icon: <Upload className="h-3.5 w-3.5" /> },
    { id: "url", label: "URL / Sitemap", icon: <LinkIcon className="h-3.5 w-3.5" /> },
    { id: "crawl", label: "Web Crawl", icon: <Globe className="h-3.5 w-3.5" /> },
    { id: "git", label: "Git Repos", icon: <Github className="h-3.5 w-3.5" /> },
    { id: "cloud", label: "Cloud Storage", icon: <Cloud className="h-3.5 w-3.5" /> },
    { id: "cms", label: "CMS", icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: "api", label: "API", icon: <Zap className="h-3.5 w-3.5" /> },
  ];

  const stageColors: Record<string, string> = {
    fetching: "text-blue-400",
    parsing: "text-yellow-400",
    analyzing: "text-purple-400",
    done: "text-green-400",
    error: "text-red-400",
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Ingestion</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Import content from any source to analyse and optimise for AI visibility</p>
      </div>

      {/* Active ingestion progress */}
      {ingestingItems.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active Ingestions</p>
          {ingestingItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-1.5 px-2 rounded-lg bg-muted/30">
              {item.stage === "done" ? (
                <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
              ) : item.stage === "error" ? (
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              ) : (
                <Loader2 className="h-4 w-4 text-blue-400 animate-spin flex-shrink-0" />
              )}
              <span className="text-sm flex-1 truncate font-medium">{item.title}</span>
              <span className={`text-xs ${stageColors[item.stage]}`}>{item.stageLabel}</span>
            </div>
          ))}
        </div>
      )}

      {/* Target selector */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Ingest into:</span>
          <select
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              const p = products.find((p) => p.id === e.target.value);
              setSelectedFolderId(p?.folders[0]?.id ?? "");
              setShowNewFolderInput(false);
            }}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <span className="text-muted-foreground text-sm">→</span>
          <select
            value={showNewFolderInput ? NEW_FOLDER_SENTINEL : selectedFolderId}
            onChange={(e) => {
              if (e.target.value === NEW_FOLDER_SENTINEL) {
                setShowNewFolderInput(true);
                setNewFolderName("");
              } else {
                setSelectedFolderId(e.target.value);
                setShowNewFolderInput(false);
              }
            }}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {(selectedProduct?.folders ?? []).map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
            <option value={NEW_FOLDER_SENTINEL}>+ New folder…</option>
          </select>
        </div>

        {/* New folder input */}
        {showNewFolderInput && (
          <div className="flex items-center gap-2 pl-1">
            <FolderPlus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") { setShowNewFolderInput(false); setNewFolderName(""); }
              }}
              placeholder="Folder name…"
              autoFocus
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring flex-1 max-w-xs"
            />
            <button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-60"
            >
              Create
            </button>
            <button
              onClick={() => { setShowNewFolderInput(false); setNewFolderName(""); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        {/* Tab bar */}
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit mb-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── File Upload ── */}
        {activeTab === "upload" && (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium mb-1">Drop files here or click to select</p>
              <p className="text-sm text-muted-foreground">PDF, DOCX, TXT, Markdown, HTML, CSV, JSON — up to 50MB each</p>
              <p className="text-xs text-muted-foreground mt-1">TXT, MD, HTML, CSV, JSON: full content extracted · PDF, DOCX: metadata + size estimation</p>
            </div>
            {acceptedFiles.length > 0 && (
              <div className="space-y-2">
                {acceptedFiles.map((file) => (
                  <div key={file.name} className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{file.name}</span>
                    <span className="text-muted-foreground text-xs">{(file.size / 1024).toFixed(0)} KB</span>
                  </div>
                ))}
                <button
                  onClick={() => {
                    acceptedFiles.forEach((file) => {
                      const title = file.name.replace(/\.\w+$/, "");
                      runIngest(title, "#", "file", () => extractFileContent(file));
                    });
                  }}
                  className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" /> Upload & Analyse {acceptedFiles.length} file{acceptedFiles.length !== 1 ? "s" : ""}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── URL / Sitemap ── */}
        {activeTab === "url" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Page URL or Sitemap</label>
              <p className="text-xs text-muted-foreground mb-2">
                Enter a single page URL or a sitemap.xml URL to import. Content is fetched in real time via a CORS proxy.
              </p>
              <div className="flex gap-2">
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && urlInput) {
                      const url = urlInput;
                      setUrlInput("");
                      runIngest(titleFromUrl(url), url, "url", () => fetchUrlContent(url));
                    }
                  }}
                  placeholder="https://example.com/page or https://example.com/sitemap.xml"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  disabled={!urlInput}
                  onClick={() => {
                    const url = urlInput;
                    setUrlInput("");
                    runIngest(titleFromUrl(url), url, "url", () => fetchUrlContent(url));
                  }}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  Ingest
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Web Crawl ── */}
        {activeTab === "crawl" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Website URL</label>
              <p className="text-xs text-muted-foreground mb-2">
                The starting URL will be fetched and parsed. Full recursive crawling requires the GAEO server-side agent.
              </p>
              <input
                value={crawlUrl}
                onChange={(e) => setCrawlUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Max pages</label>
              <select
                value={crawlMaxPages}
                onChange={(e) => setCrawlMaxPages(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                {["10", "25", "50", "100", "250", "500"].map((v) => (
                  <option key={v} value={v}>{v} pages</option>
                ))}
              </select>
            </div>
            <button
              disabled={!crawlUrl}
              onClick={() => {
                const url = crawlUrl;
                setCrawlUrl("");
                runIngest(`Crawl: ${titleFromUrl(url)}`, url, "crawl", () => fetchUrlContent(url));
              }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2"
            >
              <Globe className="h-4 w-4" /> Start Crawl
            </button>
          </div>
        )}

        {/* ── Git Repos ── */}
        {activeTab === "git" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Git Platform</label>
              <div className="flex gap-2 mb-4">
                {GIT_OPTIONS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGitPlatform(g.id)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      gitPlatform === g.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{selectedGitOption.name} Repository URL</label>
              <input
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
                placeholder={selectedGitOption.placeholder}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {gitPlatform === "github"
                ? "GitHub: fetches README via the public API (no auth needed for public repos)"
                : `${selectedGitOption.name}: ingests README and documentation files`}
            </p>
            <button
              disabled={!gitUrl}
              onClick={() => {
                const url = gitUrl;
                const platform = selectedGitOption.name;
                const repoName = url.split("/").slice(-2).join(" / ");
                setGitUrl("");
                if (gitPlatform === "github") {
                  runIngest(`${repoName}`, url, "api", () => fetchGitHubRepo(url));
                } else {
                  runIngest(`${platform}: ${repoName}`, url, "api", async () =>
                    simulateGitRepoIngest(url, platform)
                  );
                }
              }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2"
            >
              <Code2 className="h-4 w-4" /> Ingest Repository
            </button>
          </div>
        )}

        {/* ── Cloud Storage ── */}
        {activeTab === "cloud" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Cloud Provider</label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {CLOUD_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCloudProvider(c.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors ${
                      cloudProvider === c.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                    }`}
                  >
                    <span className="text-2xl">{c.icon}</span>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <Cloud className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">Connect {CLOUD_OPTIONS.find((c) => c.id === cloudProvider)?.name}</p>
              <p className="text-xs text-muted-foreground mb-3">
                Authorise GAEO to access your cloud storage and select folders to sync.
                OAuth flow runs on the GAEO server — content is simulated for this preview.
              </p>
              <button
                onClick={() => {
                  const provider = CLOUD_OPTIONS.find((c) => c.id === cloudProvider)!;
                  runIngest(`${provider.name} Import`, "#", "api", async () =>
                    simulateCloudIngest(provider.name, "/Documents")
                  );
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Connect & Import
              </button>
            </div>
          </div>
        )}

        {/* ── CMS ── */}
        {activeTab === "cms" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">CMS Platform</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {CMS_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCms(c.id)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      selectedCms === c.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mb-4">{CMS_OPTIONS.find((c) => c.id === selectedCms)?.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Site / API URL</label>
              <input value={cmsUrl} onChange={(e) => setCmsUrl(e.target.value)} placeholder="https://your-site.com"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">API Key / Token</label>
              <input type="password" value={cmsApiKey} onChange={(e) => setCmsApiKey(e.target.value)} placeholder="••••••••••••••••"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <button
              disabled={!cmsUrl || !cmsApiKey}
              onClick={() => {
                const cmsName = CMS_OPTIONS.find((c) => c.id === selectedCms)!.name;
                const url = cmsUrl;
                setCmsUrl("");
                setCmsApiKey("");
                runIngest(`${cmsName}: ${titleFromUrl(url)}`, url, "cms", async () =>
                  simulateCmsIngest(cmsName, url)
                );
              }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2"
            >
              <Database className="h-4 w-4" /> Connect & Sync
            </button>
          </div>
        )}

        {/* ── REST API ── */}
        {activeTab === "api" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Fetch content from a REST API endpoint. GAEO will attempt a direct request first, then fall back to a CORS proxy if needed.
            </p>
            <div className="flex gap-2 items-center rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm font-mono">
              <span className="text-primary text-xs">POST</span>
              <span className="text-muted-foreground">/api/v1/ingest</span>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Example payload:</p>
              <pre className="text-xs text-muted-foreground overflow-x-auto">{`{
  "title": "My Document",
  "content": "...",
  "source_url": "https://example.com/doc"
}`}</pre>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Your API Key</label>
              <div className="flex gap-2">
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gaeo_live_••••••••••••••••"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring" />
                <button onClick={() => toast.success("API key copied")}
                  className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent">Copy</button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Test Endpoint URL</label>
              <div className="flex gap-2">
                <input value={apiEndpoint} onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://your-api.com/content-feed"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                <button
                  disabled={!apiEndpoint}
                  onClick={() => {
                    const endpoint = apiEndpoint;
                    setApiEndpoint("");
                    runIngest(`API: ${titleFromUrl(endpoint)}`, endpoint, "api", () =>
                      fetchApiContent(endpoint)
                    );
                  }}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
                  Ingest
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* All Content Assets */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold">All Content Assets</h2>
          <span className="text-sm text-muted-foreground">{allItems.length} total</span>
        </div>
        <div className="divide-y divide-border">
          {allItems.map((asset) => (
            <button
              key={asset.id}
              onClick={() => navigate(`/dashboard/content/${asset.id}`)}
              className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30 transition-colors w-full text-left"
            >
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{asset.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {asset.productName} → {asset.folderName} · {asset.source_type}
                  {asset.word_count ? ` · ${asset.word_count.toLocaleString()} words` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {asset.score !== null && (
                  <span className={`text-xs font-bold ${asset.score >= 65 ? "text-green-400" : asset.score >= 45 ? "text-yellow-400" : "text-red-400"}`}>
                    {asset.score}
                  </span>
                )}
                {statusIcon[asset.status]}
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
