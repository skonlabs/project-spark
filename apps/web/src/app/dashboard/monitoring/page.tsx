"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
} from "lucide-react";
import toast from "react-hot-toast";
import { monitoringApi } from "@/lib/api";
import { MonitoringAlert } from "@/types";

const DEMO_JOBS = [
  {
    id: "1",
    name: "Daily AI Answer Monitor",
    is_active: true,
    schedule: "0 9 * * *",
    prompts: ["What are the best AI observability tools?", "How to monitor LLM applications?"],
    target_models: ["claude-sonnet-4-6", "gpt-4o"],
    last_run_at: "2026-03-08T09:00:00Z",
    last_run_status: "completed",
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Weekly Competitor Check",
    is_active: false,
    schedule: "0 9 * * 1",
    prompts: ["Best AI monitoring platforms", "Top LLM tools 2026"],
    target_models: ["claude-sonnet-4-6", "gpt-4o", "gemini-1.5-pro"],
    last_run_at: "2026-03-04T09:00:00Z",
    last_run_status: "completed",
    created_at: "2026-02-15T00:00:00Z",
  },
];

const DEMO_ALERTS: MonitoringAlert[] = [
  {
    id: "1",
    job_id: "1",
    project_id: "demo",
    severity: "critical",
    alert_type: "competitor_dominant",
    title: "CompetitorAlpha dominates AI answers (82% share of voice)",
    description: "CompetitorAlpha appears in 82% of AI responses for your monitored prompts.",
    prompt: "What are the best AI observability tools?",
    llm_model: "claude-sonnet-4-6",
    previous_value: 74,
    current_value: 82,
    is_read: false,
    is_resolved: false,
    created_at: "2026-03-08T09:05:00Z",
  },
  {
    id: "2",
    job_id: "1",
    project_id: "demo",
    severity: "warning",
    alert_type: "low_visibility",
    title: "Low AI visibility: 12% mention rate",
    description: "Your product is mentioned in only 12% of monitored prompts.",
    prompt: null,
    llm_model: null,
    previous_value: 18,
    current_value: 12,
    is_read: false,
    is_resolved: false,
    created_at: "2026-03-08T09:05:00Z",
  },
  {
    id: "3",
    job_id: "2",
    project_id: "demo",
    severity: "info",
    alert_type: "rank_improved",
    title: "Rank improved for 'AI monitoring tools' prompt",
    description: "Your rank improved from #5 to #3 for this prompt.",
    prompt: "AI monitoring tools",
    llm_model: "gpt-4o",
    previous_value: 5,
    current_value: 3,
    is_read: true,
    is_resolved: true,
    created_at: "2026-03-04T09:10:00Z",
  },
];

const severityConfig = {
  critical: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
  warning: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
};

export default function MonitoringPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJob, setNewJob] = useState({
    name: "",
    prompts: [""],
    target_models: ["claude-sonnet-4-6", "gpt-4o"],
    schedule: "0 9 * * *",
  });

  const createMutation = useMutation({
    mutationFn: () =>
      monitoringApi.createJob({
        project_id: "demo-project-id",
        ...newJob,
        prompts: newJob.prompts.filter((p) => p.trim()),
      }),
    onSuccess: () => {
      toast.success("Monitoring job created!");
      setShowCreateForm(false);
    },
    onError: () => toast.error("Failed to create monitoring job"),
  });

  const unreadCount = DEMO_ALERTS.filter((a) => !a.is_read).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Answer Monitoring</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Continuously track how AI systems mention your brand
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Monitor
        </button>
      </div>

      {/* Unread alerts banner */}
      {unreadCount > 0 && (
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 flex items-center gap-3">
          <Bell className="h-5 w-5 text-orange-400 flex-shrink-0" />
          <p className="text-sm">
            <span className="font-medium text-orange-400">{unreadCount} unread alert{unreadCount > 1 ? "s" : ""}</span>
            {" "}— Review your monitoring alerts below
          </p>
        </div>
      )}

      {/* Create form */}
      {showCreateForm && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Create Monitoring Job</h2>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Job Name</label>
            <input
              value={newJob.name}
              onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
              placeholder="Daily AI Answer Monitor"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Prompts to Monitor</label>
            {newJob.prompts.map((prompt, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={prompt}
                  onChange={(e) => {
                    const updated = [...newJob.prompts];
                    updated[i] = e.target.value;
                    setNewJob({ ...newJob, prompts: updated });
                  }}
                  placeholder="What are the best AI observability tools?"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {i === newJob.prompts.length - 1 && (
                  <button
                    onClick={() => setNewJob({ ...newJob, prompts: [...newJob.prompts, ""] })}
                    className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Schedule</label>
            <select
              value={newJob.schedule}
              onChange={(e) => setNewJob({ ...newJob, schedule: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="0 9 * * *">Daily at 9am</option>
              <option value="0 9 * * 1">Weekly on Monday</option>
              <option value="0 9 1 * *">Monthly on 1st</option>
              <option value="0 */6 * * *">Every 6 hours</option>
            </select>
          </div>
          <button
            onClick={() => createMutation.mutate()}
            disabled={!newJob.name || createMutation.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2"
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Monitor
          </button>
        </div>
      )}

      {/* Monitoring jobs */}
      <div className="space-y-3">
        <h2 className="font-semibold">Active Monitors</h2>
        {DEMO_JOBS.map((job) => (
          <div key={job.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${job.is_active ? "bg-green-400" : "bg-muted-foreground"}`} />
                <div>
                  <p className="font-medium">{job.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {job.prompts.length} prompts · {job.target_models.length} models · {
                      job.schedule === "0 9 * * *" ? "Daily at 9am" :
                      job.schedule === "0 9 * * 1" ? "Weekly on Monday" : job.schedule
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  job.last_run_status === "completed"
                    ? "bg-green-500/15 text-green-400"
                    : "bg-red-500/15 text-red-400"
                }`}>
                  {job.last_run_status}
                </span>
                <button
                  className={`rounded-lg border p-1.5 transition-colors ${
                    job.is_active
                      ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                  title={job.is_active ? "Pause" : "Resume"}
                >
                  <Power className="h-3.5 w-3.5" />
                </button>
                <button
                  className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="Run now"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Monitoring: {job.prompts.slice(0, 2).join(", ")}
                {job.prompts.length > 2 && ` +${job.prompts.length - 2} more`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        <h2 className="font-semibold">Recent Alerts</h2>
        {DEMO_ALERTS.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              className={`rounded-xl border p-4 ${config.border} ${config.bg} ${
                !alert.is_read ? "opacity-100" : "opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.color}`} />
                <div className="flex-1">
                  <p className={`font-medium text-sm ${config.color}`}>{alert.title}</p>
                  {alert.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {alert.prompt && <span>Prompt: &ldquo;{alert.prompt}&rdquo;</span>}
                    {alert.llm_model && <span>Model: {alert.llm_model}</span>}
                    <span>{new Date(alert.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {!alert.is_read && (
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  )}
                  {alert.is_resolved && (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
