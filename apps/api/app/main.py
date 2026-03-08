"""
GAEO Platform — FastAPI application entry point.
"""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import ORJSONResponse

from app.api.v1.router import api_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup / shutdown hooks."""
    # Startup
    print(f"🚀 GAEO Platform starting — env={settings.app_env}")
    yield
    # Shutdown
    print("Shutting down GAEO Platform")


app = FastAPI(
    title="GAEO Platform API",
    description="Generative AI Engine Optimization Platform — REST API",
    version=settings.version,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    default_response_class=ORJSONResponse,
    lifespan=lifespan,
)

# ─── Middleware ───────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# ─── Routes ───────────────────────────────────────────────────────────────────

app.include_router(api_router)


# ─── Health check ─────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "gaeo-api",
        "version": settings.version,
        "environment": settings.app_env,
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "name": "GAEO Platform API",
        "version": settings.version,
        "docs": "/docs",
    }
