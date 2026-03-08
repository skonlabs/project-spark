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
} from "lucide-react";
import toast from "react-hot-toast";
import type { ContentAsset } from "@/types";

const statusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-4 w-4 text-green-400" />,
  pending: <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />,
  processing: <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />,
  failed: <AlertCircle className="h-4 w-4 text-red-400" />,
};

type IngestTab = "upload" | "url" | "crawl" | "github";

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<IngestTab>("upload");
  const [urlInput, setUrlInput] = useState("");
  const [crawlUrl, setCrawlUrl] = useState("");
  const [crawlMaxPages, setCrawlMaxPages] = useState("50");
  const [githubUrl, setGithubUrl] = useState("");

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

  const demoAssets: ContentAsset[] = [
    { id: "1", project_id: "demo", title: "Product Overview", source_url: null, source_type: "file_upload", file_type: "pdf", status: "completed", word_count: 1250, tags: [], created_at: "2026-03-07T10:00:00Z" },
    { id: "2", project_id: "demo", title: "Getting Started Guide", source_url: "https://docs.example.com/getting-started", source_type: "url", file_type: "html", status: "completed", word_count: 2100, tags: [], created_at: "2026-03-07T11:00:00Z" },
    { id: "3", project_id: "demo", title: "API Reference", source_url: null, source_type: "github", file_type: null, status: "completed", word_count: 4500, tags: [], created_at: "2026-03-07T12:00:00Z" },
    { id: "4", project_id: "demo", title: "Blog: Why AI Observability Matters", source_url: "https://blog.example.com", source_type: "crawl", file_type: "html", status: "processing", word_count: null, tags: [], created_at: "2026-03-08T09:00:00Z" },
    { id: "5", project_id: "demo", title: "Architecture Document.docx", source_url: null, source_type: "file_upload", file_type: "docx", status: "failed", word_count: null, tags: [], created_at: "2026-03-08T08:00:00Z" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Ingestion</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Import content from any source to analyze and optimize</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit mb-5">
          {[
            { id: "upload", label: "File Upload", icon: Upload },
            { id: "url", label: "URL / Sitemap", icon: LinkIcon },
            { id: "crawl", label: "Web Crawl", icon: Globe },
            { id: "github", label: "GitHub", icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as IngestTab)} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="h-3.5 w-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "upload" && (
          <div className="space-y-4">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium mb-1">Drop files here or click to select</p>
              <p className="text-sm text-muted-foreground">PDF, DOCX, TXT, Markdown, HTML — up to 50MB each</p>
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
                <button onClick={() => toast.success("Files uploaded!")} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground flex items-center justify-center gap-2">
                  Upload {acceptedFiles.length} file(s)
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "url" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">URL</label>
              <div className="flex gap-2">
                <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://example.com/page" className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                <button disabled={!urlInput} onClick={() => { toast.success("URL queued"); setUrlInput(""); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">Ingest</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "crawl" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Website URL</label>
              <input value={crawlUrl} onChange={(e) => setCrawlUrl(e.target.value)} placeholder="https://example.com" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Max pages</label>
              <select value={crawlMaxPages} onChange={(e) => setCrawlMaxPages(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                {["10", "25", "50", "100", "250", "500"].map((v) => <option key={v} value={v}>{v} pages</option>)}
              </select>
            </div>
            <button disabled={!crawlUrl} onClick={() => { toast.success("Crawl started!"); setCrawlUrl(""); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2">Start Crawl</button>
          </div>
        )}

        {activeTab === "github" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">GitHub Repository URL</label>
              <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/owner/repo" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <button disabled={!githubUrl} onClick={() => { toast.success("GitHub ingestion started"); setGithubUrl(""); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2">Ingest Repository</button>
          </div>
        )}
      </div>

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
