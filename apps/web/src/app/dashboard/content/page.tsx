"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle, CheckCircle2, Clock, FileText, Github,
  Globe, Link as LinkIcon, Loader2, Trash2, Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { ingestApi } from "@/lib/api";
import { useProjectStore } from "@/lib/stores/project-store";
import { ContentAsset } from "@/types";

const statusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-4 w-4 text-green-400" />,
  pending: <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />,
  processing: <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />,
  failed: <AlertCircle className="h-4 w-4 text-red-400" />,
};

const sourceIcon: Record<string, React.ReactNode> = {
  file_upload: <FileText className="h-4 w-4 text-muted-foreground" />,
  url: <Globe className="h-4 w-4 text-muted-foreground" />,
  github: <Github className="h-4 w-4 text-muted-foreground" />,
  crawl: <Globe className="h-4 w-4 text-muted-foreground" />,
  sitemap: <Globe className="h-4 w-4 text-muted-foreground" />,
};

type IngestTab = "upload" | "url" | "crawl" | "github";

export default function ContentPage() {
  const { activeProject } = useProjectStore();
  const projectId = activeProject?.id;
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<IngestTab>("upload");
  const [urlInput, setUrlInput] = useState("");
  const [crawlUrl, setCrawlUrl] = useState("");
  const [crawlMaxPages, setCrawlMaxPages] = useState("50");
  const [githubUrl, setGithubUrl] = useState("");

  const { data: assetsData, isLoading } = useQuery({
    queryKey: ["assets", projectId],
    queryFn: () => ingestApi.listAssets(projectId!).then((r) => r.data),
    enabled: !!projectId,
    refetchInterval: (query) => {
      const assets: ContentAsset[] = query.state.data?.assets ?? [];
      return assets.some((a) => a.status === "processing" || a.status === "pending") ? 3000 : false;
    },
  });

  const assets: ContentAsset[] = assetsData?.assets ?? [];

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

  const uploadMutation = useMutation({
    mutationFn: async () => {
      for (const file of acceptedFiles) {
        await ingestApi.uploadFile(projectId!, file);
      }
    },
    onSuccess: () => {
      toast.success(`${acceptedFiles.length} file(s) uploaded!`);
      qc.invalidateQueries({ queryKey: ["assets", projectId] });
    },
    onError: () => toast.error("Upload failed"),
  });

  const urlMutation = useMutation({
    mutationFn: () => ingestApi.ingestUrl({ projectId: projectId!, url: urlInput }),
    onSuccess: () => {
      toast.success("URL queued for ingestion");
      setUrlInput("");
      qc.invalidateQueries({ queryKey: ["assets", projectId] });
    },
    onError: () => toast.error("Failed to ingest URL"),
  });

  const crawlMutation = useMutation({
    mutationFn: () => ingestApi.crawl({ projectId: projectId!, baseUrl: crawlUrl, maxPages: parseInt(crawlMaxPages) }),
    onSuccess: () => {
      toast.success(`Crawl started — up to ${crawlMaxPages} pages`);
      setCrawlUrl("");
      qc.invalidateQueries({ queryKey: ["assets", projectId] });
    },
    onError: () => toast.error("Failed to start crawl"),
  });

  const deleteMutation = useMutation({
    mutationFn: (assetId: string) => ingestApi.deleteAsset(projectId!, assetId),
    onSuccess: () => {
      toast.success("Asset deleted");
      qc.invalidateQueries({ queryKey: ["assets", projectId] });
    },
    onError: () => toast.error("Failed to delete asset"),
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Ingestion</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Import content to analyze and optimize for AI visibility</p>
      </div>

      {!projectId ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">Select a project to manage content.</div>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit mb-5">
              {[
                { id: "upload", label: "File Upload", icon: Upload },
                { id: "url", label: "URL / Sitemap", icon: LinkIcon },
                { id: "crawl", label: "Web Crawl", icon: Globe },
                { id: "github", label: "GitHub", icon: Github },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as IngestTab)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    <Icon className="h-3.5 w-3.5" />{tab.label}
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
                    <button onClick={() => uploadMutation.mutate()} disabled={uploadMutation.isPending}
                      className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center justify-center gap-2">
                      {uploadMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      Upload {acceptedFiles.length} file(s)
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "url" && (
              <div className="space-y-4">
                <label className="text-sm font-medium mb-1.5 block">URL</label>
                <div className="flex gap-2">
                  <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/page or https://example.com/sitemap.xml"
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                  <button onClick={() => urlMutation.mutate()} disabled={!urlInput || urlMutation.isPending}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
                    {urlMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ingest"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Supports single pages and sitemap.xml files</p>
              </div>
            )}

            {activeTab === "crawl" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Website URL</label>
                  <input value={crawlUrl} onChange={(e) => setCrawlUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Max pages</label>
                  <select value={crawlMaxPages} onChange={(e) => setCrawlMaxPages(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    {["10", "25", "50", "100"].map((v) => <option key={v} value={v}>{v} pages</option>)}
                  </select>
                </div>
                <button onClick={() => crawlMutation.mutate()} disabled={!crawlUrl || crawlMutation.isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2">
                  {crawlMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Start Crawl
                </button>
              </div>
            )}

            {activeTab === "github" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">GitHub Repository URL</label>
                  <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                  <p className="text-xs text-muted-foreground mt-1.5">Ingests Markdown, RST, and text files from the repository</p>
                </div>
                <p className="text-sm text-muted-foreground">GitHub ingestion available via URL ingestion — point to a raw file or use the URL tab for individual docs.</p>
              </div>
            )}
          </div>

          {/* Asset list */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-semibold">Content Assets</h2>
              <span className="text-sm text-muted-foreground">{assets.length} total</span>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : assets.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No content ingested yet.</div>
            ) : (
              <div className="divide-y divide-border">
                {assets.map((asset) => (
                  <div key={asset.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30 transition-colors">
                    <div className="flex-shrink-0">{sourceIcon[asset.source_type] || <FileText className="h-4 w-4 text-muted-foreground" />}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{asset.title || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {asset.source_url || asset.source_type} {asset.word_count ? `· ${asset.word_count.toLocaleString()} words` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {asset.file_type && <span className="text-xs bg-muted rounded px-1.5 py-0.5">{asset.file_type}</span>}
                      {statusIcon[asset.status]}
                      <button onClick={() => deleteMutation.mutate(asset.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
