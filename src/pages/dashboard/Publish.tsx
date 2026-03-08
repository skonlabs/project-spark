import { useState } from "react";
import {
  Send,
  CheckCircle2,
  Clock,
  Globe,
  Plus,
  Settings,
  Trash2,
  Calendar,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface Connector {
  id: string;
  platform: string;
  name: string;
  url: string;
  status: "connected" | "error" | "disconnected";
  lastSync: string | null;
  publishedCount: number;
}

interface ScheduledPost {
  id: string;
  title: string;
  connector_id: string;
  connector_name: string;
  scheduled_at: string;
  status: "scheduled" | "published" | "failed";
}

const PLATFORM_LOGOS: Record<string, string> = {
  wordpress: "WP",
  webflow: "WF",
  ghost: "GH",
  contentful: "CF",
  notion: "NT",
  github: "GH",
};

const PLATFORM_COLORS: Record<string, string> = {
  wordpress: "bg-blue-500/20 text-blue-400",
  webflow: "bg-purple-500/20 text-purple-400",
  ghost: "bg-yellow-500/20 text-yellow-400",
  contentful: "bg-cyan-500/20 text-cyan-400",
  notion: "bg-muted text-muted-foreground",
  github: "bg-gray-500/20 text-gray-400",
};

const DEMO_CONNECTORS: Connector[] = [
  { id: "c1", platform: "wordpress", name: "Company Blog (WordPress)", url: "https://blog.acme.com", status: "connected", lastSync: "2026-03-08T09:00:00Z", publishedCount: 23 },
  { id: "c2", platform: "webflow", name: "Marketing Site (Webflow)", url: "https://acme.com", status: "connected", lastSync: "2026-03-07T15:00:00Z", publishedCount: 8 },
  { id: "c3", platform: "notion", name: "Internal Docs (Notion)", url: "https://notion.so/acme", status: "error", lastSync: "2026-03-05T10:00:00Z", publishedCount: 45 },
  { id: "c4", platform: "github", name: "Docs Repo (GitHub)", url: "https://github.com/acme/docs", status: "disconnected", lastSync: null, publishedCount: 0 },
];

const DEMO_SCHEDULED: ScheduledPost[] = [
  { id: "s1", title: "What is AI Observability? Complete Guide", connector_id: "c1", connector_name: "Company Blog", scheduled_at: "2026-03-10T09:00:00Z", status: "scheduled" },
  { id: "s2", title: "GAEO Platform vs LangSmith: 2026 Comparison", connector_id: "c1", connector_name: "Company Blog", scheduled_at: "2026-03-12T09:00:00Z", status: "scheduled" },
  { id: "s3", title: "AI Observability FAQ", connector_id: "c2", connector_name: "Marketing Site", scheduled_at: "2026-03-09T12:00:00Z", status: "scheduled" },
  { id: "s4", title: "Getting Started with LLM Monitoring", connector_id: "c1", connector_name: "Company Blog", scheduled_at: "2026-03-07T09:00:00Z", status: "published" },
  { id: "s5", title: "Best AI Debug Tools", connector_id: "c3", connector_name: "Internal Docs", scheduled_at: "2026-03-06T10:00:00Z", status: "failed" },
];

const statusConfig = {
  connected: { icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-400", label: "Connected" },
  error: { icon: <AlertCircle className="h-4 w-4" />, color: "text-red-400", label: "Error" },
  disconnected: { icon: <Globe className="h-4 w-4" />, color: "text-muted-foreground", label: "Not Connected" },
};

const postStatusConfig = {
  scheduled: { icon: <Clock className="h-4 w-4" />, color: "text-blue-400 bg-blue-500/10", label: "Scheduled" },
  published: { icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-400 bg-green-500/10", label: "Published" },
  failed: { icon: <AlertCircle className="h-4 w-4" />, color: "text-red-400 bg-red-500/10", label: "Failed" },
};

const AVAILABLE_PLATFORMS = ["wordpress", "webflow", "ghost", "contentful", "notion", "github"];

export default function PublishPage() {
  const [showAddConnector, setShowAddConnector] = useState(false);
  const [newConnector, setNewConnector] = useState({ platform: "wordpress", name: "", url: "", apiKey: "" });
  const [tab, setTab] = useState<"connectors" | "scheduled" | "history">("connectors");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Publishing Connectors</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Publish AI-optimized content directly to your CMS and repositories</p>
        </div>
        <button
          onClick={() => setShowAddConnector(!showAddConnector)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Connector
        </button>
      </div>

      {/* Add connector form */}
      {showAddConnector && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Add Publishing Connector</h2>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Platform</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => setNewConnector({ ...newConnector, platform: p })}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                    newConnector.platform === p ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className={`h-5 w-5 rounded flex items-center justify-center text-xs font-bold ${PLATFORM_COLORS[p]}`}>
                    {PLATFORM_LOGOS[p]}
                  </span>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Connection Name</label>
              <input value={newConnector.name} onChange={(e) => setNewConnector({ ...newConnector, name: e.target.value })} placeholder="My Blog" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Site URL</label>
              <input value={newConnector.url} onChange={(e) => setNewConnector({ ...newConnector, url: e.target.value })} placeholder="https://your-site.com" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">API Key / Access Token</label>
            <input type="password" value={newConnector.apiKey} onChange={(e) => setNewConnector({ ...newConnector, apiKey: e.target.value })} placeholder="••••••••••••••••" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div className="flex gap-2">
            <button
              disabled={!newConnector.name || !newConnector.url || !newConnector.apiKey}
              onClick={() => { toast.success("Connector added and verified!"); setShowAddConnector(false); setNewConnector({ platform: "wordpress", name: "", url: "", apiKey: "" }); }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" /> Connect & Verify
            </button>
            <button onClick={() => setShowAddConnector(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
        {[
          { id: "connectors", label: "Connectors" },
          { id: "scheduled", label: "Scheduled" },
          { id: "history", label: "History" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Connectors */}
      {tab === "connectors" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEMO_CONNECTORS.map((connector) => {
            const status = statusConfig[connector.status];
            const platformColor = PLATFORM_COLORS[connector.platform] || "bg-muted text-muted-foreground";
            return (
              <div key={connector.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${platformColor}`}>
                    {PLATFORM_LOGOS[connector.platform]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{connector.name}</p>
                    <a href={connector.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      {connector.url.replace("https://", "")} <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${status.color}`}>
                    {status.icon} {status.label}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                  <div className="rounded-lg bg-muted/40 px-2 py-2">
                    <p className="text-lg font-bold">{connector.publishedCount}</p>
                    <p className="text-xs text-muted-foreground">Published</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 px-2 py-2">
                    <p className="text-xs text-muted-foreground mt-1">Last sync</p>
                    <p className="text-xs font-medium">
                      {connector.lastSync ? new Date(connector.lastSync).toLocaleDateString("en", { month: "short", day: "numeric" }) : "Never"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {connector.status === "connected" && (
                    <>
                      <button onClick={() => toast.success("Publishing draft...")} className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground flex items-center justify-center gap-1">
                        <Send className="h-3 w-3" /> Publish
                      </button>
                      <button onClick={() => toast.success("Synced!")} className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  {connector.status === "error" && (
                    <button onClick={() => toast.success("Reconnecting...")} className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 px-3 py-1.5 text-xs font-medium flex items-center justify-center gap-1">
                      <RefreshCw className="h-3 w-3" /> Reconnect
                    </button>
                  )}
                  {connector.status === "disconnected" && (
                    <button onClick={() => toast.success("Connecting...")} className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent flex items-center justify-center gap-1">
                      <Globe className="h-3 w-3" /> Connect
                    </button>
                  )}
                  <button onClick={() => toast.success("Settings opened")} className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent">
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => toast.error("Disconnect not available in demo")} className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-red-400 hover:bg-accent">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scheduled posts */}
      {tab === "scheduled" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Scheduled Publications</h2>
            <button onClick={() => toast.success("Schedule post")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <Calendar className="h-3.5 w-3.5" /> Schedule Post
            </button>
          </div>
          <div className="divide-y divide-border">
            {DEMO_SCHEDULED.map((post) => {
              const status = postStatusConfig[post.status];
              return (
                <div key={post.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${status.color}`}>
                    {status.icon} {status.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">{post.connector_name} · {new Date(post.scheduled_at).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  {post.status === "scheduled" && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => toast.success("Published now!")} className="text-xs text-primary hover:underline">Publish now</button>
                      <button onClick={() => toast.success("Post cancelled")} className="text-xs text-muted-foreground hover:text-red-400">Cancel</button>
                    </div>
                  )}
                  {post.status === "failed" && (
                    <button onClick={() => toast.success("Retrying...")} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 flex-shrink-0">
                      <RefreshCw className="h-3 w-3" /> Retry
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold">Publication History</h2>
          </div>
          <div className="divide-y divide-border">
            {DEMO_SCHEDULED.filter((p) => p.status !== "scheduled").concat(DEMO_SCHEDULED.filter((p) => p.status === "scheduled")).map((post) => {
              const status = postStatusConfig[post.status];
              return (
                <div key={post.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${status.color}`}>
                    {status.icon} {status.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">{post.connector_name} · {new Date(post.scheduled_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  {post.status === "published" && (
                    <button onClick={() => toast.success("View post")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 flex-shrink-0">
                      <ExternalLink className="h-3 w-3" /> View
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
