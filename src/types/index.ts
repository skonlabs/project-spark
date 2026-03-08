/**
 * Shared TypeScript types for the GAEO Platform frontend.
 */

// ─── User & Auth ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  plan: "free" | "pro" | "enterprise";
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  product_name: string;
  product_description: string | null;
  product_url: string | null;
  product_category: string | null;
  target_audience: string | null;
  visibility_score: number | null;
  score_breakdown: ScoreBreakdown | null;
  target_llms: string[];
  monitoring_prompts: string[];
  is_active: boolean;
  created_at: string;
}

// ─── Scores ───────────────────────────────────────────────────────────────────

export interface ScoreBreakdown {
  overall: number;
  entity_clarity: number;
  category_ownership: number;
  educational_authority: number;
  prompt_coverage: number;
  comparison_coverage: number;
  ecosystem_coverage: number;
  external_authority: number;
  community_signal: number;
  consistency: number;
  structure_quality: number;
}

// ─── Analysis ─────────────────────────────────────────────────────────────────

export interface AnalysisReport {
  id: string;
  project_id: string;
  status: "pending" | "running" | "completed" | "failed";
  overall_score: number | null;
  findings: Record<string, unknown>;
  recommendations: Recommendation[];
  content_gaps: ContentGap[];
  prompt_clusters: PromptClusters;
  content_roadmap: RoadmapItem[];
  created_at: string;
}

export interface Recommendation {
  action: string;
  impact: number;
  example?: string;
}

export interface ContentGap {
  topic: string;
  importance: number;
  suggested_title: string;
  suggested_format: "blog" | "faq" | "guide" | "comparison";
}

export interface PromptClusters {
  [key: string]: string[] | undefined;
}

export interface RoadmapItem {
  priority: number;
  title: string;
  type: "blog" | "guide" | "faq" | "comparison" | "landing_page" | "documentation";
  target_prompts: string[];
  expected_impact: string;
  score_impact: { metric: string; estimated_gain: number };
  outline: string[];
}

// ─── Simulation ───────────────────────────────────────────────────────────────

export interface SimulationJob {
  id: string;
  project_id: string;
  name: string | null;
  status: "pending" | "running" | "completed" | "failed";
  prompts: string[];
  target_models: string[];
  summary: SimulationSummary;
  created_at: string;
}

export interface SimulationSummary {
  total_tests: number;
  mention_count: number;
  mention_rate: number;
  avg_rank: number | null;
  avg_sentiment: number;
  product_share_of_voice: number;
  model_breakdown: Record<string, ModelBreakdown>;
  competitor_share_of_voice: Record<string, number>;
}

export interface ModelBreakdown {
  total_prompts: number;
  mentions: number;
  mention_rate: number;
  avg_rank: number | null;
}

export interface SimulationResult {
  id: string;
  prompt: string;
  llm_model: string;
  llm_provider: string;
  response_text: string | null;
  product_mentioned: boolean | null;
  mention_rank: number | null;
  mention_context: string | null;
  sentiment_score: number | null;
  confidence_score: number | null;
  entities_mentioned: string[];
  competitors_mentioned: string[];
  latency_ms: number | null;
}

// ─── Content ──────────────────────────────────────────────────────────────────

export interface ContentAsset {
  id: string;
  project_id: string;
  title: string | null;
  source_url: string | null;
  source_type: string;
  file_type: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  word_count: number | null;
  tags: string[];
  created_at: string;
}

// ─── Competitive ──────────────────────────────────────────────────────────────

export interface Competitor {
  id: string;
  project_id: string;
  name: string;
  website_url: string | null;
  description: string | null;
  llm_share_of_voice: number | null;
  avg_mention_rank: number | null;
  mention_frequency: number | null;
  avg_sentiment: number | null;
}

// ─── Monitoring ───────────────────────────────────────────────────────────────

export interface MonitoringAlert {
  id: string;
  job_id: string;
  project_id: string;
  severity: "info" | "warning" | "critical";
  alert_type: string;
  title: string;
  description: string | null;
  prompt: string | null;
  llm_model: string | null;
  previous_value: number | null;
  current_value: number | null;
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

export type ScoreGrade = "A" | "B" | "C" | "D" | "F";

export function getScoreGrade(score: number): ScoreGrade {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 65) return "text-blue-500";
  if (score >= 50) return "text-yellow-500";
  if (score >= 35) return "text-orange-500";
  return "text-red-500";
}
