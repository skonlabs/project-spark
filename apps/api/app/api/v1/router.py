"""Main API v1 router — aggregates all endpoint routers."""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    projects,
    analysis,
    simulation,
    ingest,
    competitive,
    topics,
    content,
    monitoring,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(projects.router)
api_router.include_router(analysis.router)
api_router.include_router(simulation.router)
api_router.include_router(ingest.router)
api_router.include_router(competitive.router)
api_router.include_router(topics.router)
api_router.include_router(content.router)
api_router.include_router(monitoring.router)
