import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  FileText,
  Globe,
  Loader2,
  Plus,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Github,
  Database,
  Cloud,
  BookOpen,
  Code2,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import type { ContentAsset } from "@/types";

const statusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-4 w-4 text-green-400" />,
  pending: <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />,
  processing: <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />,
  failed: <AlertCircle className="h-4 w-4 text-red-400" />,
};

type IngestTab = "upload" | "url" | "crawl" | "git" | "cloud" | "cms" | "api";

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

export default function ContentPage() {
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

  const demoAssets: ContentAsset[] = [
    { id: "1", project_id: "demo", title: "Product Overview", source_url: null, source_type: "file_upload", file_type: "pdf", status: "completed", word_count: 1250, tags: [], created_at: "2026-03-07T10:00:00Z" },
    { id: "2", project_id: "demo", title: "Getting Started Guide", source_url: "https://docs.example.com/getting-started", source_type: "url", file_type: "html", status: "completed", word_count: 2100, tags: [], created_at: "2026-03-07T11:00:00Z" },
    { id: "3", project_id: "demo", title: "API Reference", source_url: null, source_type: "github", file_type: null, status: "completed", word_count: 4500, tags: [], created_at: "2026-03-07T12:00:00Z" },
    { id: "4", project_id: "demo", title: "Blog: Why AI Observability Matters", source_url: "https://blog.example.com", source_type: "crawl", file_type: "html", status: "processing", word_count: null, tags: [], created_at: "2026-03-08T09:00:00Z" },
    { id: "5", project_id: "demo", title: "Architecture Document.docx", source_url: null, source_type: "file_upload", file_type: "docx", status: "failed", word_count: null, tags: [], created_at: "2026-03-08T08:00:00Z" },
    { id: "6", project_id: "demo", title: "Notion: Product Roadmap", source_url: "https://notion.so/...", source_type: "notion", file_type: null, status: "completed", word_count: 890, tags: [], created_at: "2026-03-06T14:00:00Z" },
    { id: "7", project_id: "demo", title: "data-export.csv", source_url: null, source_type: "file_upload", file_type: "csv", status: "completed", word_count: 320, tags: [], created_at: "2026-03-05T10:00:00Z" },
  ];

  const tabs: { id: IngestTab; label: string; icon: React.ReactNode }[] = [
    { id: "upload", label: "File Upload", icon: <Upload className="h-3.5 w-3.5" /> },
    { id: "url", label: "URL / Sitemap", icon: <LinkIcon className="h-3.5 w-3.5" /> },
    { id: "crawl", label: "Web Crawl", icon: <Globe className="h-3.5 w-3.5" /> },
    { id: "git", label: "Git Repos", icon: <Github className="h-3.5 w-3.5" /> },
    { id: "cloud", label: "Cloud Storage", icon: <Cloud className="h-3.5 w-3.5" /> },
    { id: "cms", label: "CMS", icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: "api", label: "API", icon: <Zap className="h-3.5 w-3.5" /> },
  ];

  const selectedGitOption = GIT_OPTIONS.find((g) => g.id === gitPlatform)!;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Ingestion</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Import content from any source to analyze and optimize</p>
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

        {/* File Upload */}
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
              <p className="text-xs text-muted-foreground mt-1">Bulk: zip archives and folders supported</p>
            </div>
            {acceptedFiles.length > 0 && (
              <div className="space-y-2">
                {acceptedFiles.map((file) => (
                  <div key={file.name} className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{file.name}</span>
                    <span className="text-muted-foreground text-xs">{(file.size / 1024).toFixed(0)}KB</span>
                  </div>
                ))}
                <button
                  onClick={() => toast.success("Files uploaded!")}
                  className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground flex items-center justify-center gap-2"
                >
                  Upload {acceptedFiles.length} file(s)
                </button>
              </div>
            )}
          </div>
        )}

        {/* URL / Sitemap */}
        {activeTab === "url" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Page URL or Sitemap</label>
              <p className="text-xs text-muted-foreground mb-2">Enter a single page URL or a sitemap.xml URL to bulk-import all pages</p>
              <div className="flex gap-2">
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/page or https://example.com/sitemap.xml"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  disabled={!urlInput}
                  onClick={() => { toast.success("URL queued for ingestion"); setUrlInput(""); }}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  Ingest
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Web Crawl */}
        {activeTab === "crawl" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Website URL</label>
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
              onClick={() => { toast.success("Crawl started!"); setCrawlUrl(""); }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2"
            >
              Start Crawl
            </button>
          </div>
        )}

        {/* Git Repos */}
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
            <p className="text-xs text-muted-foreground">Ingests README, docs/, wiki, and markdown files from the repository</p>
            <button
              disabled={!gitUrl}
              onClick={() => { toast.success(`${selectedGitOption.name} ingestion started`); setGitUrl(""); }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2"
            >
              <Code2 className="h-4 w-4" /> Ingest Repository
            </button>
          </div>
        )}

        {/* Cloud Storage */}
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
              <p className="text-xs text-muted-foreground mb-3">Authorize GAEO to access your cloud storage and select folders to sync</p>
              <button
                onClick={() => toast.success("OAuth flow initiated — connect your account")}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Connect Account
              </button>
            </div>
          </div>
        )}

        {/* CMS */}
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
              <input
                value={cmsUrl}
                onChange={(e) => setCmsUrl(e.target.value)}
                placeholder="https://your-site.com"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">API Key / Token</label>
              <input
                type="password"
                value={cmsApiKey}
                onChange={(e) => setCmsApiKey(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <button
              disabled={!cmsUrl || !cmsApiKey}
              onClick={() => { toast.success(`${CMS_OPTIONS.find((c) => c.id === selectedCms)?.name} sync started`); setCmsUrl(""); setCmsApiKey(""); }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2"
            >
              <Database className="h-4 w-4" /> Connect & Sync
            </button>
          </div>
        )}

        {/* REST API Ingestion */}
        {activeTab === "api" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Use the GAEO REST API to programmatically ingest content from your own pipelines or custom sources.</p>
            <div>
              <label className="text-sm font-medium mb-1.5 block">API Endpoint</label>
              <div className="flex gap-2 items-center rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm font-mono">
                <span className="text-primary text-xs">POST</span>
                <span className="text-muted-foreground">/api/v1/ingest</span>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Example request payload:</p>
              <pre className="text-xs text-muted-foreground overflow-x-auto">{`{
  "title": "My Document",
  "content": "...",
  "source_url": "https://example.com/doc",
  "metadata": {
    "topic": "AI observability",
    "audience": "developers"
  }
}`}</pre>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Your API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gaeo_live_••••••••••••••••"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                />
                <button
                  onClick={() => toast.success("API key copied to clipboard")}
                  className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Test Endpoint URL</label>
              <div className="flex gap-2">
                <input
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://your-api.com/content-feed"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  disabled={!apiEndpoint}
                  onClick={() => { toast.success("API ingestion test initiated"); setApiEndpoint(""); }}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Assets List */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Content Assets</h2>
          <span className="text-sm text-muted-foreground">{demoAssets.length} total</span>
        </div>
        <div className="divide-y divide-border">
          {demoAssets.map((asset) => (
            <div key={asset.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30 transition-colors">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{asset.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {asset.source_url || asset.source_type} • {asset.word_count ? `${asset.word_count.toLocaleString()} words` : "processing"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {asset.file_type && <span className="text-xs bg-muted rounded px-1.5 py-0.5">{asset.file_type}</span>}
                {statusIcon[asset.status]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
