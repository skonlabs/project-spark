/**
 * API client — typed wrapper around the GAEO Next.js API routes.
 *
 * All routes live under /api/* (served by Next.js itself),
 * so we use a relative base URL to avoid CORS issues and config drift.
 */
import axios, { AxiosInstance } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 120_000, // 2 min — analysis/simulation can be slow
})

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// On 401 clear session and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.clear()
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; fullName?: string; workspaceName?: string }) =>
    api.post('/auth/register', data),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  me: () => api.get('/auth/me'),
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projectsApi = {
  list: (workspaceId?: string) =>
    api.get('/projects', { params: workspaceId ? { workspaceId } : undefined }),

  get: (id: string) => api.get(`/projects/${id}`),

  create: (data: {
    name: string
    productName: string
    productDescription?: string
    productCategory?: string
    productUrl?: string
    targetAudience?: string
    targetLlms?: string[]
    monitoringPrompts?: string[]
  }) => api.post('/projects', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/projects/${id}`, data),

  delete: (id: string) => api.delete(`/projects/${id}`),
}

// ─── Analysis ─────────────────────────────────────────────────────────────────

export const analysisApi = {
  /** Enqueues analysis — returns { reportId, status: 'running' } immediately */
  run: (projectId: string) =>
    api.post('/analysis/run', { projectId }),

  getScore: (projectId: string) =>
    api.get(`/analysis/${projectId}/score`),

  listReports: (projectId: string, limit = 10) =>
    api.get(`/analysis/${projectId}/reports`, { params: { limit } }),
}

// ─── Simulation ───────────────────────────────────────────────────────────────

export const simulationApi = {
  run: (data: { projectId: string; name?: string; prompts: string[]; targetModels: string[] }) =>
    api.post('/simulation/run', data),

  listJobs: (projectId: string) =>
    api.get(`/simulation/${projectId}/jobs`),

  /** Poll this to check job status */
  getJob: (jobId: string) =>
    api.get(`/simulation/jobs/${jobId}`),

  getResults: (jobId: string) =>
    api.get(`/simulation/jobs/${jobId}/results`),
}

// ─── Ingestion ────────────────────────────────────────────────────────────────

export const ingestApi = {
  uploadFile: (projectId: string, file: File) => {
    const form = new FormData()
    form.append('projectId', projectId)
    form.append('file', file)
    return api.post('/ingest/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  ingestUrl: (data: { projectId: string; url: string }) =>
    api.post('/ingest/url', data),

  crawl: (data: { projectId: string; baseUrl: string; maxPages?: number }) =>
    api.post('/ingest/crawl', data),

  listAssets: (projectId: string, limit = 50) =>
    api.get(`/ingest/${projectId}/assets`, { params: { limit } }),

  deleteAsset: (projectId: string, assetId: string) =>
    api.delete(`/ingest/${projectId}/assets`, { params: { assetId } }),
}

// ─── Competitive ──────────────────────────────────────────────────────────────

export const competitiveApi = {
  addCompetitor: (data: { projectId: string; name: string; websiteUrl?: string; description?: string }) =>
    api.post('/competitive/competitors', data),

  listCompetitors: (projectId: string) =>
    api.get('/competitive/competitors', { params: { projectId } }),

  deleteCompetitor: (competitorId: string) =>
    api.delete('/competitive/competitors', { params: { id: competitorId } }),

  getShareOfVoice: (projectId: string) =>
    api.get(`/competitive/${projectId}/share-of-voice`),
}

// ─── Topics ───────────────────────────────────────────────────────────────────

export const topicsApi = {
  generate: (data: { projectId: string; productName: string; productCategory: string }) =>
    api.post('/topics/generate', data),

  getGraph: (projectId: string) =>
    api.get(`/topics/${projectId}/graph`),

  getGaps: (projectId: string, minImportance = 5) =>
    api.get(`/topics/${projectId}/gaps`, { params: { minImportance } }),
}

// ─── Content Generation ───────────────────────────────────────────────────────

export const contentApi = {
  generateArticle: (data: {
    productName: string
    productDescription: string
    topic: string
    targetAudience: string
    targetPrompts: string[]
    tone?: string
  }) => api.post('/content/generate/article', data),

  generateFAQ: (data: { productName: string; topic: string; numQuestions?: number }) =>
    api.post('/content/generate/faq', data),

  generateComparison: (data: {
    productName: string
    competitorName: string
    productDescription: string
    features?: string[]
  }) => api.post('/content/generate/comparison', data),

  generateEntityDefinition: (data: {
    entityName: string
    productName: string
    category: string
  }) => api.post('/content/generate/entity-definition', data),

  optimize: (data: { content: string; productName: string; targetPrompts: string[] }) =>
    api.post('/content/optimize', data),
}

// ─── Monitoring ───────────────────────────────────────────────────────────────

export const monitoringApi = {
  createJob: (data: {
    projectId: string
    name: string
    prompts: string[]
    targetModels: string[]
    schedule?: string
  }) => api.post('/monitoring/jobs', data),

  listJobs: (projectId: string) =>
    api.get('/monitoring/jobs', { params: { projectId } }),

  /** Toggle isActive by patching the job */
  toggleJob: (jobId: string, isActive: boolean) =>
    api.patch(`/monitoring/jobs/${jobId}`, { isActive }),

  deleteJob: (jobId: string) =>
    api.delete(`/monitoring/jobs/${jobId}`),

  runNow: (jobId: string) =>
    api.post(`/monitoring/jobs/${jobId}/run-now`),

  getAlerts: (projectId: string, unreadOnly = false) =>
    api.get(`/monitoring/${projectId}/alerts`, { params: { unread: unreadOnly } }),

  markAlertsRead: (projectId: string, alertIds: string[]) =>
    api.patch(`/monitoring/${projectId}/alerts`, { alertIds, isRead: true }),
}
