import { useState, useMemo } from "react";
import {
  Send, CheckCircle2, Clock, Globe, Plus, Settings, Trash2,
  Calendar, ExternalLink, RefreshCw, AlertCircle, FileText, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useContent } from "@/contexts/ContentContext";

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
  platform: string;
  scheduled_at: string;
  status: "scheduled" | "published" | "failed";
}

const PLATFORM_LOGOS: Record<string, string> = { wordpress: "WP", webflow: "WF", ghost: "GH", contentful: "CF", notion: "NT", github: "GH" };
const PLATFORM_COLORS: Record<string, string> = {
  wordpress: "bg-amber-500/15 text-amber-600", webflow: "bg-primary/15 text-primary", ghost: "bg-yellow-500/15 text-yellow-600",
  contentful: "bg-teal-500/15 text-teal-600", notion: "bg-muted text-muted-foreground", github: "bg-muted text-muted-foreground",
};

const INITIAL_CONNECTORS: Connector[] = [
  { id: "c1", platform: "wordpress", name: "Company Blog (WordPress)", url: "https://blog.acme.com", status: "connected", lastSync: "2026-03-08T09:00:00Z", publishedCount: 23 },
  { id: "c2", platform: "webflow", name: "Marketing Site (Webflow)", url: "https://acme.com", status: "connected", lastSync: "2026-03-07T15:00:00Z", publishedCount: 8 },
  { id: "c3", platform: "notion", name: "Internal Docs (Notion)", url: "https://notion.so/acme", status: "error", lastSync: "2026-03-05T10:00:00Z", publishedCount: 45 },
];

const INITIAL_HISTORY: ScheduledPost[] = [
  { id: "s4", title: "Getting Started with LLM Monitoring", connector_id: "c1", connector_name: "Company Blog", platform: "wordpress", scheduled_at: "2026-03-07T09:00:00Z", status: "published" },
  { id: "s5", title: "Best AI Debug Tools", connector_id: "c3", connector_name: "Internal Docs", platform: "notion", scheduled_at: "2026-03-06T10:00:00Z", status: "failed" },
];

const AVAILABLE_PLATFORMS = ["wordpress", "webflow", "ghost", "contentful", "notion", "github"];

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

export default function PublishPage() {
  const { products } = useContent();
  const [connectors] = useState(INITIAL_CONNECTORS);
  const [showAddConnector, setShowAddConnector] = useState(false);
  const [newConnector, setNewConnector] = useState({ platform: "wordpress", name: "", url: "", apiKey: "" });
  const [tab, setTab] = useState<"ready" | "scheduled" | "history">("ready");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedPlatform, setSelectedPlatform] = useState("wordpress");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [history, setHistory] = useState<ScheduledPost[]>(INITIAL_HISTORY);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Get content ready to publish (analyzed items with score > 0)
  const readyContent = useMemo(() => {
    return products.flatMap((p) =>
      p.folders.flatMap((f) =>
        f.items.filter((item) => item.status === "analyzed" && item.score !== null)
          .map((item) => ({ ...item, productName: p.name, folderName: f.name }))
      )
    );
  }, [products]);

  const connectedPlatforms = connectors.filter((c) => c.status === "connected");

  function toggleItem(id: string) {
    setSelectedItems((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  function selectAll() {
    if (selectedItems.size === readyContent.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(readyContent.map((c) => c.id)));
  }

  function handlePublishNow() {
    if (selectedItems.size === 0) { toast.error("Select content to publish"); return; }
    const items = readyContent.filter((c) => selectedItems.has(c.id));
    const connector = connectors.find((c) => c.platform === selectedPlatform && c.status === "connected");
    if (!connector) { toast.error("No connected platform found"); return; }
    
    const newHistory: ScheduledPost[] = items.map((item) => ({
      id: `pub-${Date.now()}-${item.id}`,
      title: item.title,
      connector_id: connector.id,
      connector_name: connector.name,
      platform: connector.platform,
      scheduled_at: new Date().toISOString(),
      status: "published",
    }));
    setHistory([...newHistory, ...history]);
    setSelectedItems(new Set());
    toast.success(`${items.length} item(s) published to ${connector.name}!`);
  }

  function handleSchedulePublish() {
    if (selectedItems.size === 0 || !scheduleDate) { toast.error("Select content and a date"); return; }
    const items = readyContent.filter((c) => selectedItems.has(c.id));
    const connector = connectors.find((c) => c.platform === selectedPlatform && c.status === "connected");
    if (!connector) { toast.error("No connected platform found"); return; }

    const scheduledAt = `${scheduleDate}T${scheduleTime}:00Z`;
    const newScheduled: ScheduledPost[] = items.map((item) => ({
      id: `sch-${Date.now()}-${item.id}`,
      title: item.title,
      connector_id: connector.id,
      connector_name: connector.name,
      platform: connector.platform,
      scheduled_at: scheduledAt,
      status: "scheduled",
    }));
    setScheduledPosts([...scheduledPosts, ...newScheduled]);
    setSelectedItems(new Set());
    setShowScheduleModal(false);
    toast.success(`${items.length} item(s) scheduled for ${new Date(scheduledAt).toLocaleDateString()}!`);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Publish</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Publish AI-optimized content to your platforms</p>
        </div>
        <button onClick={() => setShowAddConnector(!showAddConnector)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Add Connector
        </button>
      </div>

      {showAddConnector && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Add Publishing Connector</h2>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Platform</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_PLATFORMS.map((p) => (
                <button key={p} onClick={() => setNewConnector({ ...newConnector, platform: p })}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                    newConnector.platform === p ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                  }`}>
                  <span className={`h-5 w-5 rounded flex items-center justify-center text-xs font-bold ${PLATFORM_COLORS[p]}`}>{PLATFORM_LOGOS[p]}</span>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Connection Name</label>
              <input value={newConnector.name} onChange={(e) => setNewConnector({ ...newConnector, name: e.target.value })} placeholder="My Blog"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Site URL</label>
              <input value={newConnector.url} onChange={(e) => setNewConnector({ ...newConnector, url: e.target.value })} placeholder="https://your-site.com"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">API Key / Access Token</label>
            <input type="password" value={newConnector.apiKey} onChange={(e) => setNewConnector({ ...newConnector, apiKey: e.target.value })} placeholder="••••••••••••••••"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div className="flex gap-2">
            <button disabled={!newConnector.name || !newConnector.url || !newConnector.apiKey}
              onClick={() => { toast.success("Connector added!"); setShowAddConnector(false); setNewConnector({ platform: "wordpress", name: "", url: "", apiKey: "" }); }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Connect & Verify
            </button>
            <button onClick={() => setShowAddConnector(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
        {[
          { id: "ready", label: `Ready to Publish (${readyContent.length})` },
          { id: "scheduled", label: `Scheduled (${scheduledPosts.length})` },
          { id: "history", label: `History (${history.length})` },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Ready to Publish */}
      {tab === "ready" && (
        <div className="space-y-4">
          {/* Action bar */}
          {selectedItems.size > 0 && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium">{selectedItems.size} selected</span>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-muted-foreground">Platform:</span>
                <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="rounded-lg border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  {connectedPlatforms.map((c) => (
                    <option key={c.id} value={c.platform}>{c.name}</option>
                  ))}
                </select>
                <button onClick={handlePublishNow}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Send className="h-3.5 w-3.5" /> Publish Now
                </button>
                <button onClick={() => setShowScheduleModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <Calendar className="h-3.5 w-3.5" /> Schedule
                </button>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selectedItems.size === readyContent.length && readyContent.length > 0}
                  onChange={selectAll} className="rounded border-input" />
                Select all
              </label>
              <span className="text-xs text-muted-foreground ml-auto">{readyContent.length} items ready</span>
            </div>
            <div className="divide-y divide-border">
              {readyContent.map((item) => (
                <label key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/15 transition-colors cursor-pointer">
                  <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => toggleItem(item.id)} className="rounded border-input" />
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.productName} → {item.folderName}</p>
                  </div>
                  <span className={`text-xs font-bold tabular-nums ${
                    (item.score ?? 0) >= 65 ? "text-green-400" : (item.score ?? 0) >= 45 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {item.score}/100
                  </span>
                </label>
              ))}
              {readyContent.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No analyzed content ready to publish yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scheduled */}
      {tab === "scheduled" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold">Scheduled Publications</h2>
          </div>
          {scheduledPosts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No scheduled publications. Select content and schedule from the "Ready" tab.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {scheduledPosts.map((post) => {
                const status = postStatusConfig[post.status];
                return (
                  <div key={post.id} className="flex items-center gap-3 px-5 py-3">
                    <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${status.color}`}>
                      {status.icon} {status.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {post.connector_name} · {new Date(post.scheduled_at).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {post.status === "scheduled" && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => {
                          setScheduledPosts(scheduledPosts.filter((p) => p.id !== post.id));
                          setHistory([{ ...post, status: "published", scheduled_at: new Date().toISOString() }, ...history]);
                          toast.success("Published now!");
                        }} className="text-xs text-primary hover:underline">Publish now</button>
                        <button onClick={() => {
                          setScheduledPosts(scheduledPosts.filter((p) => p.id !== post.id));
                          toast.success("Cancelled");
                        }} className="text-xs text-muted-foreground hover:text-red-400">Cancel</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold">Publication History</h2>
          </div>
          {history.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p className="text-sm">No publication history yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {history.map((post) => {
                const status = postStatusConfig[post.status];
                return (
                  <div key={post.id} className="flex items-center gap-3 px-5 py-3">
                    <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${status.color}`}>
                      {status.icon} {status.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {post.connector_name} · {new Date(post.scheduled_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    {post.status === "published" && (
                      <button onClick={() => toast.success("Opening...")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 flex-shrink-0">
                        <ExternalLink className="h-3 w-3" /> View
                      </button>
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
          )}
        </div>
      )}

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowScheduleModal(false)}>
            <motion.div initial={{ scale: 0.97 }} animate={{ scale: 1 }} exit={{ scale: 0.97 }}
              className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-sm">Schedule Publication</h2>
                <button onClick={() => setShowScheduleModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Date</label>
                  <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Time</label>
                  <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <p className="text-xs text-muted-foreground">{selectedItems.size} item(s) will be scheduled</p>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={handleSchedulePublish} disabled={!scheduleDate}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground flex-1 disabled:opacity-60">Schedule</button>
                <button onClick={() => setShowScheduleModal(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
