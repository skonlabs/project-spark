"""Analysis endpoints — run AEO analysis, get scores, view reports."""
from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.analysis import AnalysisReport, AnalysisStatus
from app.models.content import ContentAsset, ContentStatus
from app.models.project import Project
from app.models.user import User

router = APIRouter(prefix="/analysis", tags=["Analysis"])


class AnalysisRunRequest(BaseModel):
    project_id: str
    content_asset_ids: list[str] | None = None  # None = use all project content


class ScoreResponse(BaseModel):
    project_id: str
    overall: float | None
    entity_clarity: float | None
    category_ownership: float | None
    educational_authority: float | None
    prompt_coverage: float | None
    comparison_coverage: float | None
    ecosystem_coverage: float | None
    external_authority: float | None
    community_signal: float | None
    consistency: float | None
    structure_quality: float | None


class ReportResponse(BaseModel):
    id: str
    project_id: str
    status: str
    overall_score: float | None
    findings: dict
    recommendations: list
    content_gaps: list
    prompt_clusters: dict
    content_roadmap: list
    created_at: str

    model_config = {"from_attributes": True}

    def model_post_init(self, __context):
        if hasattr(self, "created_at") and self.created_at:
            self.created_at = str(self.created_at)


@router.post("/run", status_code=status.HTTP_202_ACCEPTED)
async def run_analysis(
    payload: AnalysisRunRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger an asynchronous AEO analysis for a project."""
    # Validate project access
    project = await _get_project(payload.project_id, db)

    # Create report record
    report = AnalysisReport(
        project_id=payload.project_id,
        status=AnalysisStatus.pending,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    # Dispatch to Celery
    background_tasks.add_task(
        _dispatch_analysis_task,
        report_id=report.id,
        project_id=payload.project_id,
        asset_ids=payload.content_asset_ids,
    )

    return {
        "report_id": report.id,
        "status": "pending",
        "message": "Analysis started. Results will be available shortly.",
    }


@router.get("/{project_id}/score", response_model=ScoreResponse)
async def get_score(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the current AI Visibility Score for a project."""
    project = await _get_project(project_id, db)
    breakdown = project.score_breakdown or {}

    return ScoreResponse(
        project_id=project_id,
        overall=project.visibility_score,
        entity_clarity=breakdown.get("entity_clarity"),
        category_ownership=breakdown.get("category_ownership"),
        educational_authority=breakdown.get("educational_authority"),
        prompt_coverage=breakdown.get("prompt_coverage"),
        comparison_coverage=breakdown.get("comparison_coverage"),
        ecosystem_coverage=breakdown.get("ecosystem_coverage"),
        external_authority=breakdown.get("external_authority"),
        community_signal=breakdown.get("community_signal"),
        consistency=breakdown.get("consistency"),
        structure_quality=breakdown.get("structure_quality"),
    )


@router.get("/{project_id}/reports", response_model=list[ReportResponse])
async def list_reports(
    project_id: str,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List analysis reports for a project (most recent first)."""
    result = await db.execute(
        select(AnalysisReport)
        .where(AnalysisReport.project_id == project_id)
        .order_by(AnalysisReport.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/reports/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single analysis report."""
    result = await db.execute(
        select(AnalysisReport).where(AnalysisReport.id == report_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/reports/{report_id}/roadmap")
async def get_roadmap(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the content roadmap from an analysis report."""
    result = await db.execute(
        select(AnalysisReport).where(AnalysisReport.id == report_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"roadmap": report.content_roadmap}


# ─── Helpers ──────────────────────────────────────────────────────────────────

async def _get_project(project_id: str, db: AsyncSession) -> Project:
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def _dispatch_analysis_task(
    report_id: str, project_id: str, asset_ids: list[str] | None
) -> None:
    """Dispatch analysis to Celery worker."""
    try:
        from app.workers.tasks import run_analysis_task
        run_analysis_task.delay(
            report_id=report_id,
            project_id=project_id,
            asset_ids=asset_ids,
        )
    except Exception:
        # If Celery not available, we'll log but not fail the request
        pass
