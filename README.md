# GAEO — Generative AI Engine Optimization Platform

> The industry standard for AI discovery optimization. Understand, measure, and improve your visibility in LLM-generated answers across ChatGPT, Claude, Gemini, Grok, Perplexity, and every emerging AI search engine.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-green)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-teal)](https://fastapi.tiangolo.com/)

---

## What is GAEO?

Traditional SEO optimizes for Google rankings. But discovery is shifting — users increasingly ask AI assistants instead of search engines. **GAEO is the first platform purpose-built for AI Engine Optimization (AEO).**

GAEO helps companies:
- Understand **why** their brand doesn't appear in AI answers
- Measure their **AI Visibility Score** across all major LLMs
- Simulate LLM responses to evaluate competitive positioning
- Generate AI-optimized content that LLMs cite
- Monitor AI mentions continuously and receive alerts
- Benchmark against competitors across the AI discovery landscape

---

## Platform Architecture

```
aeo-engine/
├── apps/
│   ├── api/                    # FastAPI backend (Python 3.11+)
│   │   ├── app/
│   │   │   ├── api/v1/         # REST API endpoints
│   │   │   ├── core/           # Config, auth, database
│   │   │   ├── models/         # SQLAlchemy ORM models
│   │   │   ├── schemas/        # Pydantic schemas
│   │   │   ├── services/       # Business logic services
│   │   │   ├── workers/        # Celery background workers
│   │   │   └── utils/          # Utilities
│   │   └── requirements.txt
│   └── web/                    # Next.js 14 frontend (TypeScript)
│       └── src/
│           ├── app/            # App Router pages
│           ├── components/     # React components
│           ├── lib/            # API client, utilities
│           ├── hooks/          # Custom React hooks
│           └── types/          # TypeScript types
├── packages/
│   ├── ui/                     # Shared UI components
│   └── types/                  # Shared TypeScript types
├── infrastructure/
│   ├── docker/                 # Dockerfiles
│   └── nginx/                  # Reverse proxy config
└── docker-compose.yml
```

## Core Features

| Feature | Description |
|---|---|
| **Universal Content Ingestion** | PDF, DOCX, HTML, GitHub, web crawling, CMS connectors |
| **AI Visibility Score** | Composite score (0-100) measuring LLM discoverability |
| **LLM Simulation Engine** | Test content across Claude, ChatGPT, Gemini, Grok |
| **Competitive Analysis** | LLM share of voice, ranking distribution, mention frequency |
| **Topic Graph** | Ecosystem mapping, gap detection, competitor topic ownership |
| **AI Answer Monitoring** | Continuous monitoring with historical tracking and alerts |
| **Content Optimization** | AI-powered rewriting, FAQ generation, prompt-aligned content |
| **Content Roadmap** | Auto-generated roadmap based on gap analysis |
| **Publishing Connectors** | WordPress, Webflow, Ghost, Contentful, Notion, GitHub |

## Tech Stack

### Backend
- **Runtime**: Python 3.11+
- **Framework**: FastAPI (async)
- **Database**: PostgreSQL 15 + pgvector extension
- **Cache / Queue**: Redis 7
- **Background Jobs**: Celery 5
- **AI / LLM**: Anthropic Claude API (primary), OpenAI, Google Gemini
- **Embeddings**: OpenAI text-embedding-3-large / FastEmbed
- **Auth**: JWT + OAuth2 (Google, Microsoft, Okta, SAML)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand + React Query (TanStack Query)
- **Charts**: Recharts + D3.js
- **Graph**: React Flow (topic graph visualization)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Object Storage**: S3-compatible (MinIO for local dev)
- **Search**: PostgreSQL full-text + pgvector semantic search

---

## Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+
- API keys: Anthropic (required), OpenAI (optional), Google AI (optional)

### 1. Clone & configure

```bash
git clone https://github.com/your-org/aeo-engine.git
cd aeo-engine
cp .env.example .env
# Edit .env with your API keys
```

### 2. Start all services

```bash
docker-compose up -d
```

### 3. Initialize database

```bash
docker-compose exec api alembic upgrade head
docker-compose exec api python -m app.core.seed
```

### 4. Access the platform

- **Web App**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **API ReDoc**: http://localhost:8000/redoc

---

## API Reference

Full API documentation is available at `/docs` (Swagger) and `/redoc` (ReDoc) when running locally.

### Key Endpoints

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/ingest/upload
POST   /api/v1/ingest/url
POST   /api/v1/analysis/run
GET    /api/v1/analysis/{project_id}/score
POST   /api/v1/simulation/run
GET    /api/v1/competitive/{project_id}
GET    /api/v1/topics/{project_id}/graph
POST   /api/v1/content/optimize
POST   /api/v1/content/generate
GET    /api/v1/monitoring/{project_id}/alerts
```

---

## License

MIT — See [LICENSE](LICENSE) for details.
