"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Loader2, Plus, Swords, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { competitiveApi } from "@/lib/api";

const DEMO_COMPETITORS = [
  { name: "Your Product", share: 12, rank: 4.2, sentiment: 0.6, isYou: true },
  { name: "CompetitorAlpha", share: 35, rank: 1.8, sentiment: 0.7, isYou: false },
  { name: "CompetitorBeta", share: 22, rank: 2.5, sentiment: 0.5, isYou: false },
  { name: "CompetitorGamma", share: 18, rank: 3.1, sentiment: 0.4, isYou: false },
  { name: "Others", share: 13, rank: null, sentiment: 0, isYou: false },
];

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f97316", "#ef4444"];
const YOU_COLOR = "#3b82f6";

export default function CompetitivePage() {
  const [newCompetitor, setNewCompetitor] = useState({ name: "", website_url: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const qc = useQueryClient();

  const addMutation = useMutation({
    mutationFn: () =>
      competitiveApi.addCompetitor({
        project_id: "demo-project-id",
        ...newCompetitor,
      }),
    onSuccess: () => {
      toast.success("Competitor added!");
      setNewCompetitor({ name: "", website_url: "" });
      setShowAddForm(false);
      qc.invalidateQueries({ queryKey: ["competitors"] });
    },
    onError: () => toast.error("Failed to add competitor"),
  });

  const analyzeMutation = useMutation({
    mutationFn: () =>
      competitiveApi.analyze({
        project_id: "demo-project-id",
        prompts: [
          "What are the best AI observability tools?",
          "How do I monitor LLM applications?",
        ],
        target_models: ["claude-sonnet-4-6", "gpt-4o"],
      }),
    onSuccess: () => toast.success("Competitive analysis started!"),
    onError: () => toast.error("Failed to start analysis"),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Competitive Analysis</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            LLM share of voice across you and your competitors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            {analyzeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Swords className="h-4 w-4" />
            )}
            Run Analysis
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Competitor
          </button>
        </div>
      </div>

      {/* Add competitor form */}
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
              value={newCompetitor.website_url}
              onChange={(e) => setNewCompetitor({ ...newCompetitor, website_url: e.target.value })}
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

      {/* Share of voice chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">LLM Share of Voice</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={DEMO_COMPETITORS} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "hsl(215 20.2% 65.1%)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(215 20.2% 65.1%)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(222.2 84% 4.9%)",
                  border: "1px solid hsl(217.2 32.6% 17.5%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`${value}%`, "Share of Voice"]}
              />
              <Bar dataKey="share" radius={[4, 4, 0, 0]}>
                {DEMO_COMPETITORS.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.isYou ? YOU_COLOR : COLORS[i % COLORS.length]}
                    opacity={entry.isYou ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Competitor table */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">Detailed Breakdown</h2>
          <div className="space-y-3">
            {DEMO_COMPETITORS.map((comp, i) => (
              <div
                key={comp.name}
                className={`flex items-center gap-3 rounded-lg p-3 ${
                  comp.isYou ? "bg-primary/10 border border-primary/30" : "hover:bg-accent/50"
                } transition-colors`}
              >
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ background: comp.isYou ? YOU_COLOR : COLORS[i % COLORS.length] }}
                />
                <span className={`flex-1 text-sm font-medium ${comp.isYou ? "text-primary" : ""}`}>
                  {comp.name}
                  {comp.isYou && (
                    <span className="ml-1.5 text-xs bg-primary/20 text-primary rounded-full px-1.5 py-0.5">
                      you
                    </span>
                  )}
                </span>
                <div className="text-right">
                  <div className="text-sm font-bold">{comp.share}%</div>
                  <div className="text-xs text-muted-foreground">
                    {comp.rank ? `Avg rank #${comp.rank}` : "N/A"}
                  </div>
                </div>
                <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${comp.share}%`,
                      background: comp.isYou ? YOU_COLOR : COLORS[i % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-4">Competitive Insights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              label: "Gap to Leader",
              value: "23%",
              detail: "CompetitorAlpha leads by 23 percentage points",
              color: "text-red-400",
            },
            {
              label: "Your Position",
              value: "#4 of 5",
              detail: "You rank 4th in LLM share of voice",
              color: "text-orange-400",
            },
            {
              label: "Growth Potential",
              value: "+23%",
              detail: "Estimated gain with full AEO implementation",
              color: "text-green-400",
            },
          ].map((insight) => (
            <div key={insight.label} className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">{insight.label}</p>
              <p className={`text-2xl font-bold mt-1 ${insight.color}`}>{insight.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{insight.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
