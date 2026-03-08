/**
 * API client — typed wrapper around the GAEO REST API.
 */
import axios, { AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Axios instance ───────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 60_000,
});

// Attach auth token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          localStorage.setItem("access_token", data.access_token);
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          return api.request(error.config);
        } catch {
          localStorage.clear();
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; full_name?: string }) =>
    api.post("/auth/register", data),

  login: (email: string, password: string) => {
    const form = new FormData();
    form.append("username", email);
    form.append("password", password);
    return api.post("/auth/login", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refresh_token: refreshToken }),

  me: () => api.get("/auth/me"),
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projectsApi = {
  list: (workspaceId: string) =>
    api.get("/projects/", { params: { workspace_id: workspaceId } }),

  get: (id: string) => api.get(`/projects/${id}`),

  create: (data: {
    workspace_id: string;
    name: string;
    product_name: string;
    product_description?: string;
    product_category?: string;
    product_url?: string;
    target_llms?: string[];
  }) => api.post("/projects/", data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/projects/${id}`, data),

  delete: (id: string) => api.delete(`/projects/${id}`),
};

// ─── Analysis ─────────────────────────────────────────────────────────────────

export const analysisApi = {
  run: (projectId: string, assetIds?: string[]) =>
    api.post("/analysis/run", {
      project_id: projectId,
      content_asset_ids: assetIds,
    }),

  getScore: (projectId: string) => api.get(`/analysis/${projectId}/score`),

  listReports: (projectId: string, limit = 10) =>
    api.get(`/analysis/${projectId}/reports`, { params: { limit } }),

  getReport: (reportId: string) => api.get(`/analysis/reports/${reportId}`),

  getRoadmap: (reportId: string) =>
    api.get(`/analysis/reports/${reportId}/roadmap`),
};

// ─── Simulation ───────────────────────────────────────────────────────────────

export const simulationApi = {
  run: (data: {
    project_id: string;
    name?: string;
    prompts: string[];
    target_models: string[];
  }) => api.post("/simulation/run", data),

  listJobs: (projectId: string) => api.get(`/simulation/${projectId}/jobs`),

  getJob: (jobId: string) => api.get(`/simulation/jobs/${jobId}`),

  getResults: (jobId: string) => api.get(`/simulation/jobs/${jobId}/results`),

  listModels: () => api.get("/simulation/models"),
};

// ─── Ingestion ────────────────────────────────────────────────────────────────

export const ingestApi = {
  uploadFile: (projectId: string, file: File, collectionId?: string) => {
    const form = new FormData();
    form.append("project_id", projectId);
    form.append("file", file);
    if (collectionId) form.append("collection_id", collectionId);
    return api.post("/ingest/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  ingestUrl: (data: { project_id: string; url: string }) =>
    api.post("/ingest/url", data),

  ingestSitemap: (data: { project_id: string; sitemap_url: string }) =>
    api.post("/ingest/sitemap", data),

  crawl: (data: { project_id: string; base_url: string; max_pages?: number }) =>
    api.post("/ingest/crawl", data),

  ingestGitHub: (data: { project_id: string; repo_url: string }) =>
    api.post("/ingest/github", data),

  listAssets: (projectId: string, limit = 50) =>
    api.get(`/ingest/${projectId}/assets`, { params: { limit } }),
};

// ─── Competitive ──────────────────────────────────────────────────────────────

export const competitiveApi = {
  addCompetitor: (data: {
    project_id: string;
    name: string;
    website_url?: string;
  }) => api.post("/competitive/competitors", data),

  listCompetitors: (projectId: string) =>
    api.get(`/competitive/${projectId}/competitors`),

  deleteCompetitor: (competitorId: string) =>
    api.delete(`/competitive/competitors/${competitorId}`),

  analyze: (data: {
    project_id: string;
    prompts: string[];
    target_models: string[];
  }) => api.post("/competitive/analyze", data),

  getShareOfVoice: (projectId: string) =>
    api.get(`/competitive/${projectId}/share-of-voice`),

  getReports: (projectId: string) =>
    api.get(`/competitive/${projectId}/reports`),
};

// ─── Topics ───────────────────────────────────────────────────────────────────

export const topicsApi = {
  generate: (data: {
    project_id: string;
    product_name: string;
    product_category: string;
  }) => api.post("/topics/generate", data),

  getGraph: (projectId: string) => api.get(`/topics/${projectId}/graph`),

  getGaps: (projectId: string, minImportance = 5) =>
    api.get(`/topics/${projectId}/gaps`, { params: { min_importance: minImportance } }),
};

// ─── Content ──────────────────────────────────────────────────────────────────

export const contentApi = {
  optimize: (data: {
    content: string;
    product_name: string;
    product_category: string;
    target_prompts?: string[];
  }) => api.post("/content/optimize", data),

  generateArticle: (data: {
    topic: string;
    product_name: string;
    product_category: string;
    target_audience?: string;
    word_count?: number;
  }) => api.post("/content/generate/article", data),

  generateComparison: (data: {
    product_name: string;
    competitor_name: string;
    product_category: string;
    product_description: string;
  }) => api.post("/content/generate/comparison", data),

  generateFAQ: (data: {
    product_name: string;
    product_category: string;
    product_description: string;
    num_questions?: number;
  }) => api.post("/content/generate/faq", data),

  generateEntityDefinition: (data: {
    product_name: string;
    current_description: string;
    product_category: string;
  }) => api.post("/content/generate/entity-definition", data),
};

// ─── Monitoring ───────────────────────────────────────────────────────────────

export const monitoringApi = {
  createJob: (data: {
    project_id: string;
    name: string;
    prompts: string[];
    target_models: string[];
    schedule?: string;
  }) => api.post("/monitoring/jobs", data),

  listJobs: (projectId: string) => api.get(`/monitoring/${projectId}/jobs`),

  toggleJob: (jobId: string) => api.patch(`/monitoring/jobs/${jobId}/toggle`),

  runNow: (jobId: string) => api.post(`/monitoring/jobs/${jobId}/run-now`),

  getAlerts: (projectId: string, unreadOnly = false) =>
    api.get(`/monitoring/${projectId}/alerts`, { params: { unread_only: unreadOnly } }),

  markRead: (alertId: string) =>
    api.patch(`/monitoring/alerts/${alertId}/read`),

  getUnreadCount: (projectId: string) =>
    api.get(`/monitoring/${projectId}/alerts/unread-count`),
};
