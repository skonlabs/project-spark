"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Loader2, Plus, Swords, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { competitiveApi } from "@/lib/api";
import { useProjectStore } from "@/lib/stores/project-store";
import { Competitor } from "@/types";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f97316", "#ef4444", "#06b6d4"];

export default function CompetitivePage() {
  const { activeProject } = useProjectStore();
  const projectId = activeProject?.id;
  const qc = useQueryClient();
  const [newCompetitor, setNewCompetitor] = useState({ name: "", websiteUrl: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: competitorsData, isLoading } = useQuery({
    queryKey: ["competitors", projectId],
    queryFn: () => competitiveApi.listCompetitors(projectId!).then((r) => r.data),
    enabled: !!projectId,
  });

  const { data: sovData } = useQuery({
    queryKey: ["share-of-voice", projectId],
    queryFn: () => competitiveApi.getShareOfVoice(projectId!).then((r) => r.data),
    enabled: !!projectId,
  });

  const competitors: Competitor[] = competitorsData?.competitors ?? [];
  const sovEntries: Record<string, unknown>[] = sovData?.shareOfVoice ?? [];

  const addMutation = useMutation({
    mutationFn: () =>
      competitiveApi.addCompetitor({
        projectId: projectId!,
        name: newCompetitor.name,
        websiteUrl: newCompetitor.websiteUrl || undefined,
      }),
    onSuccess: () => {
      toast.success("Competitor added!");
      setNewCompetitor({ name: "", websiteUrl: "" });
      setShowAddForm(false);
      qc.invalidateQueries({ queryKey: ["competitors", projectId] });
    },
    onError: () => toast.error("Failed to add competitor"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => competitiveApi.deleteCompetitor(id),
    onSuccess: () => {
      toast.success("Competitor removed");
      qc.invalidateQueries({ queryKey: ["competitors", projectId] });
    },
    onError: () => toast.error("Failed to remove competitor"),
  });

  // Build chart data from competitors (use llm_share_of_voice if available)
  const chartData = [
    { name: activeProject?.product_name || "Your Product", share: 0, isYou: true },
    ...competitors.map((c) => ({
      name: c.name,
      share: Math.round((c.llm_share_of_voice ?? 0) * 100) / 100,
      isYou: false,
    })),
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Competitive Analysis</h1>
          <p className="text-muted-foreground text-sm mt-0.5">LLM share of voice across you and your competitors</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Competitor
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-3">Add Competitor</h2>
          <div className="flex gap-3">
            <input
              value={newCompetitor.name}
              onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
              placeholder="Competitor name"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <input
              value={newCompetitor.websiteUrl}
              onChange={(e) => setNewCompetitor({ ...newCompetitor, websiteUrl: e.target.value })}
              placeholder="Website URL (optional)"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={() => addMutation.mutate()}
              disabled={!newCompetitor.name || addMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 transition-colors"
            >
              {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold mb-4">LLM Share of Voice</h2>
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215 20.2% 65.1%)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215 20.2% 65.1%)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(222.2 84% 4.9%)", border: "1px solid hsl(217.2 32.6% 17.5%)", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: number) => [`${value}%`, "Share of Voice"]}
                  />
                  <Bar dataKey="share" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.isYou ? "#3b82f6" : COLORS[i % COLORS.length]} opacity={entry.isYou ? 1 : 0.6} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">Add competitors and run a simulation to see share of voice data.</p>
            )}
          </div>

          {/* Competitor list */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold mb-4">Competitors ({competitors.length})</h2>
            {competitors.length === 0 ? (
              <p className="text-muted-foreground text-sm">No competitors added yet. Use &ldquo;Add Competitor&rdquo; to track them.</p>
            ) : (
              <div className="space-y-2">
                {competitors.map((comp, i) => (
                  <div key={comp.id} className="flex items-center gap-3 rounded-lg p-3 hover:bg-accent/50 transition-colors">
                    <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{comp.name}</span>
                      {comp.website_url && (
                        <p className="text-xs text-muted-foreground truncate">{comp.website_url}</p>
                      )}
                    </div>
                    {comp.llm_share_of_voice !== null && (
                      <span className="text-sm font-bold">{comp.llm_share_of_voice?.toFixed(1)}%</span>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(comp.id)}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {competitors.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Swords className="h-4 w-4 text-orange-400" /> How to get competitive data
          </h2>
          <p className="text-sm text-muted-foreground">
            Run a <strong className="text-foreground">LLM Simulation</strong> on the Simulation page. After the simulation completes, the Share of Voice data will be calculated from how often each competitor appears in AI responses.
          </p>
        </div>
      )}
    </div>
  );
}
