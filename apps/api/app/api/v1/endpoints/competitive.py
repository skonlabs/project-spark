"""Competitive analysis endpoints."""
from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.competitive import Competitor, CompetitiveReport
from app.models.user import User

router = APIRouter(prefix="/competitive", tags=["Competitive Analysis"])


class CompetitorCreate(BaseModel):
    project_id: str
    name: str
    website_url: str | None = None
    description: str | None = None


class CompetitorResponse(BaseModel):
    id: str
    project_id: str
    name: str
    website_url: str | None
    description: str | None
    llm_share_of_voice: float | None
    avg_mention_rank: float | None
    mention_frequency: float | None
    avg_sentiment: float | None

    model_config = {"from_attributes": True}


class AnalyzeCompetitorsRequest(BaseModel):
    project_id: str
    prompts: list[str]
    target_models: list[str] = ["claude-sonnet-4-6", "gpt-4o"]


@router.post("/competitors", response_model=CompetitorResponse, status_code=201)
async def add_competitor(
    payload: CompetitorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a competitor to track."""
    competitor = Competitor(**payload.model_dump())
    db.add(competitor)
    await db.commit()
    await db.refresh(competitor)
    return competitor


@router.get("/{project_id}/competitors", response_model=list[CompetitorResponse])
async def list_competitors(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all competitors for a project."""
    result = await db.execute(
        select(Competitor).where(Competitor.project_id == project_id)
    )
    return result.scalars().all()


@router.delete("/competitors/{competitor_id}", status_code=204)
async def delete_competitor(
    competitor_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a competitor."""
    result = await db.execute(
        select(Competitor).where(Competitor.id == competitor_id)
    )
    competitor = result.scalar_one_or_none()
    if not competitor:
        raise HTTPException(status_code=404, detail="Competitor not found")
    await db.delete(competitor)
    await db.commit()


@router.post("/analyze", status_code=202)
async def analyze_competitors(
    payload: AnalyzeCompetitorsRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run competitive analysis across all defined competitors."""
    background_tasks.add_task(
        _dispatch_competitive_analysis,
        project_id=payload.project_id,
        prompts=payload.prompts,
        target_models=payload.target_models,
    )
    return {"message": "Competitive analysis started"}


@router.get("/{project_id}/share-of-voice")
async def get_share_of_voice(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get LLM share of voice comparison across product and competitors."""
    result = await db.execute(
        select(Competitor).where(Competitor.project_id == project_id)
    )
    competitors = result.scalars().all()

    return {
        "project_id": project_id,
        "competitors": [
            {
                "name": c.name,
                "share_of_voice": c.llm_share_of_voice or 0,
                "avg_rank": c.avg_mention_rank,
                "mention_frequency": c.mention_frequency or 0,
                "avg_sentiment": c.avg_sentiment or 0,
            }
            for c in competitors
        ],
    }


@router.get("/{project_id}/reports")
async def get_competitive_reports(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get competitive analysis reports for a project."""
    result = await db.execute(
        select(CompetitiveReport)
        .where(CompetitiveReport.project_id == project_id)
        .order_by(CompetitiveReport.created_at.desc())
        .limit(10)
    )
    reports = result.scalars().all()
    return [
        {
            "id": r.id,
            "competitor_id": r.competitor_id,
            "share_of_voice": r.share_of_voice,
            "mention_frequency": r.mention_frequency,
            "avg_sentiment": r.avg_sentiment,
            "dominant_topics": r.dominant_topics,
            "content_gaps": r.content_gaps,
            "created_at": str(r.created_at),
        }
        for r in reports
    ]


def _dispatch_competitive_analysis(
    project_id: str, prompts: list[str], target_models: list[str]
):
    try:
        from app.workers.tasks import run_competitive_analysis_task
        run_competitive_analysis_task.delay(project_id, prompts, target_models)
    except Exception:
        pass
