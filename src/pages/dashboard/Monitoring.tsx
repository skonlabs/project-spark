import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  Loader2,
  Plus,
  Power,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";
import type { MonitoringAlert } from "@/types";

const DEMO_JOBS = [
  { id: "1", name: "Daily AI Answer Monitor", is_active: true, schedule: "0 9 * * *", prompts: ["What are the best AI observability tools?", "How to monitor LLM applications?"], target_models: ["claude-sonnet-4-6", "gpt-4o"], last_run_at: "2026-03-08T09:00:00Z", last_run_status: "completed" },
  { id: "2", name: "Weekly Competitor Check", is_active: false, schedule: "0 9 * * 1", prompts: ["Best AI monitoring platforms", "Top LLM tools 2026"], target_models: ["claude-sonnet-4-6", "gpt-4o", "gemini-1.5-pro"], last_run_at: "2026-03-04T09:00:00Z", last_run_status: "completed" },
];

const DEMO_ALERTS: MonitoringAlert[] = [
  { id: "1", job_id: "1", project_id: "demo", severity: "critical", alert_type: "competitor_dominant", title: "CompetitorAlpha dominates AI answers (82% share of voice)", description: "CompetitorAlpha appears in 82% of AI responses.", prompt: "What are the best AI observability tools?", llm_model: "claude-sonnet-4-6", previous_value: 74, current_value: 82, is_read: false, is_resolved: false, created_at: "2026-03-08T09:05:00Z" },
  { id: "2", job_id: "1", project_id: "demo", severity: "warning", alert_type: "low_visibility", title: "Low AI visibility: 12% mention rate", description: "Your product is mentioned in only 12% of monitored prompts.", prompt: null, llm_model: null, previous_value: 18, current_value: 12, is_read: false, is_resolved: false, created_at: "2026-03-08T09:05:00Z" },
  { id: "3", job_id: "2", project_id: "demo", severity: "info", alert_type: "rank_improved", title: "Rank improved for 'AI monitoring tools' prompt", description: "Your rank improved from #5 to #3.", prompt: "AI monitoring tools", llm_model: "gpt-4o", previous_value: 5, current_value: 3, is_read: true, is_resolved: true, created_at: "2026-03-04T09:10:00Z" },
];

// Historical tracking data
const HISTORY_DATA = [
  { date: "Feb 1", visibility: 28, competitor1: 68, competitor2: 45 },
  { date: "Feb 8", visibility: 30, competitor1: 70, competitor2: 44 },
  { date: "Feb 15", visibility: 32, competitor1: 69, competitor2: 47 },
  { date: "Feb 22", visibility: 35, competitor1: 72, competitor2: 48 },
  { date: "Mar 1", visibility: 38, competitor1: 74, competitor2: 50 },
  { date: "Mar 8", visibility: 42, competitor1: 82, competitor2: 52 },
];

const PROMPT_HISTORY_DATA = [
  { date: "Feb 1", rank: 7, mentions: 10 },
  { date: "Feb 8", rank: 6, mentions: 14 },
  { date: "Feb 15", rank: 6, mentions: 15 },
  { date: "Feb 22", rank: 5, mentions: 16 },
  { date: "Mar 1", rank: 4, mentions: 18 },
  { date: "Mar 8", rank: 4, mentions: 18 },
];

const severityConfig = {
  critical: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
  warning: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
};

type MonitoringTab = "overview" | "history" | "alerts" | "jobs";

export default function MonitoringPage() {
  const [tab, setTab] = useState<MonitoringTab>("overview");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJob, setNewJob] = useState({ name: "", prompts: [""], schedule: "0 9 * * *" });

  const unreadCount = DEMO_ALERTS.filter((a) => !a.is_read).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">AI Answer Monitoring</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Continuously track how AI systems mention your brand</p>
        </div>
        <button onClick={() => { setShowCreateForm(!showCreateForm); setTab("jobs"); }} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Monitor
        </button>
      </div>

      {unreadCount > 0 && (
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 flex items-center gap-3">
          <Bell className="h-5 w-5 text-orange-400 flex-shrink-0" />
          <p className="text-sm"><span className="font-medium text-orange-400">{unreadCount} unread alert{unreadCount > 1 ? "s" : ""}</span> — Review your monitoring alerts below</p>
          <button onClick={() => setTab("alerts")} className="ml-auto text-xs text-orange-400 hover:underline">View Alerts</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
        {[
          { id: "overview", label: "Overview" },
          { id: "history", label: "Historical Tracking" },
          { id: "alerts", label: `Alerts${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
          { id: "jobs", label: "Monitor Jobs" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as MonitoringTab)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-2xl font-bold">42%</p>
              <p className="text-xs text-muted-foreground">Current Visibility</p>
              <p className="text-xs text-green-400 flex items-center gap-0.5 mt-1"><TrendingUp className="h-3 w-3" /> +14% vs last month</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-2xl font-bold">#4</p>
              <p className="text-xs text-muted-foreground">Avg. Rank</p>
              <p className="text-xs text-green-400 flex items-center gap-0.5 mt-1"><TrendingUp className="h-3 w-3" /> Up from #7</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-2xl font-bold">23</p>
              <p className="text-xs text-muted-foreground">Prompts Monitored</p>
              <p className="text-xs text-muted-foreground mt-1">Across 6 LLMs</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-2xl font-bold text-red-400">3</p>
              <p className="text-xs text-muted-foreground">Active Alerts</p>
              <p className="text-xs text-red-400 flex items-center gap-0.5 mt-1"><TrendingDown className="h-3 w-3" /> 2 unread</p>
            </div>
          </div>

          {/* Visibility trend chart */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-4">AI Visibility Trend — Last 5 Weeks</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={HISTORY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 17.5%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215 20.2% 65.1%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215 20.2% 65.1%)" }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "hsl(222.2 84% 4.9%)", border: "1px solid hsl(217.2 32.6% 17.5%)", borderRadius: "8px", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line type="monotone" dataKey="visibility" name="Your Product" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="competitor1" name="CompetitorAlpha" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="competitor2" name="CompetitorBeta" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Historical tracking tab */}
      {tab === "history" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-4">Share of Voice — 5 Week Trend</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={HISTORY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 17.5%)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(215 20.2% 65.1%)" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(215 20.2% 65.1%)" }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ background: "hsl(222.2 84% 4.9%)", border: "1px solid hsl(217.2 32.6% 17.5%)", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line type="monotone" dataKey="visibility" name="Your Product" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="competitor1" name="CompetitorAlpha" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
                <Line type="monotone" dataKey="competitor2" name="CompetitorBeta" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-1">Prompt: "Best AI observability tools" — Rank History</h2>
            <p className="text-xs text-muted-foreground mb-4">Lower rank = higher position in AI answers (Rank 1 = mentioned first)</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={PROMPT_HISTORY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 17.5%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215 20.2% 65.1%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215 20.2% 65.1%)" }} reversed domain={[1, 10]} tickFormatter={(v) => `#${v}`} />
                <Tooltip
                  contentStyle={{ background: "hsl(222.2 84% 4.9%)", border: "1px solid hsl(217.2 32.6% 17.5%)", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: number, name: string) => [name === "rank" ? `#${value}` : `${value}%`, name === "rank" ? "Rank" : "Mention Rate"]}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line type="monotone" dataKey="rank" name="rank" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Historical log */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold">Monitoring Log</h2>
            </div>
            <div className="divide-y divide-border">
              {[
                { date: "Mar 8, 2026", event: "Daily scan completed", detail: "Visibility: 42% (+4% vs last week)", type: "success" },
                { date: "Mar 8, 2026", event: "Alert triggered", detail: "CompetitorAlpha reached 82% share of voice", type: "alert" },
                { date: "Mar 7, 2026", event: "Daily scan completed", detail: "Visibility: 38% (+3% vs prior)", type: "success" },
                { date: "Mar 4, 2026", event: "Weekly competitor scan", detail: "3 competitor score changes detected", type: "success" },
                { date: "Mar 1, 2026", event: "Daily scan completed", detail: "Visibility: 35%, Rank improved from #6 → #5", type: "success" },
                { date: "Feb 26, 2026", event: "Alert resolved", detail: "Low visibility warning resolved — now 35%", type: "info" },
              ].map((log, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${log.type === "success" ? "bg-green-400" : log.type === "alert" ? "bg-red-400" : "bg-blue-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{log.event}</p>
                    <p className="text-xs text-muted-foreground">{log.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{log.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerts tab */}
      {tab === "alerts" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent Alerts</h2>
            <button onClick={() => toast.success("All alerts marked as read")} className="text-xs text-muted-foreground hover:text-foreground">Mark all read</button>
          </div>
          {DEMO_ALERTS.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;
            return (
              <div key={alert.id} className={`rounded-xl border p-4 ${config.border} ${config.bg} ${!alert.is_read ? "opacity-100" : "opacity-60"}`}>
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.color}`} />
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${config.color}`}>{alert.title}</p>
                    {alert.description && <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>}
                    {(alert.previous_value !== null && alert.current_value !== null) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Changed: <span className="font-mono">{alert.previous_value}{alert.alert_type === "rank_improved" ? "" : "%"}</span> → <span className="font-mono">{alert.current_value}{alert.alert_type === "rank_improved" ? "" : "%"}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {alert.prompt && <span>Prompt: "{alert.prompt}"</span>}
                      {alert.llm_model && <span>Model: {alert.llm_model}</span>}
                      <span>{new Date(alert.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!alert.is_read && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                    {alert.is_resolved && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Jobs tab */}
      {tab === "jobs" && (
        <div className="space-y-4">
          {showCreateForm && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold">Create Monitoring Job</h2>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Job Name</label>
                <input value={newJob.name} onChange={(e) => setNewJob({ ...newJob, name: e.target.value })} placeholder="Daily AI Answer Monitor" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Prompts to Monitor</label>
                {newJob.prompts.map((prompt, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={prompt} onChange={(e) => { const u = [...newJob.prompts]; u[i] = e.target.value; setNewJob({ ...newJob, prompts: u }); }} placeholder="What are the best AI observability tools?" className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                    {i === newJob.prompts.length - 1 && (
                      <button onClick={() => setNewJob({ ...newJob, prompts: [...newJob.prompts, ""] })} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent"><Plus className="h-4 w-4" /></button>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Schedule</label>
                <select value={newJob.schedule} onChange={(e) => setNewJob({ ...newJob, schedule: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option value="0 9 * * *">Daily at 9am</option>
                  <option value="0 9 * * 1">Weekly on Monday</option>
                  <option value="0 9 1 * *">Monthly on 1st</option>
                </select>
              </div>
              <button disabled={!newJob.name} onClick={() => { toast.success("Monitor created!"); setShowCreateForm(false); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2">Create Monitor</button>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="font-semibold">Active Monitors</h2>
            {DEMO_JOBS.map((job) => (
              <div key={job.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${job.is_active ? "bg-green-400" : "bg-muted-foreground"}`} />
                    <div>
                      <p className="font-medium">{job.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{job.prompts.length} prompts · {job.target_models.length} models · {job.schedule === "0 9 * * *" ? "Daily at 9am" : "Weekly on Monday"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${job.last_run_status === "completed" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>{job.last_run_status}</span>
                    <button className={`rounded-lg border p-1.5 transition-colors ${job.is_active ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : "border-border text-muted-foreground hover:bg-accent"}`} title={job.is_active ? "Pause" : "Resume"} onClick={() => toast.success(job.is_active ? "Monitor paused" : "Monitor resumed")}>
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toast.success("Running now...")} className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Run now">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">Monitoring: {job.prompts.slice(0, 2).join(", ")}{job.prompts.length > 2 && ` +${job.prompts.length - 2} more`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
