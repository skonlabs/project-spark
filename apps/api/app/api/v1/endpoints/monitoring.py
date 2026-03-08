"""AI Answer monitoring endpoints."""
from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.monitoring import MonitoringAlert, MonitoringJob
from app.models.user import User

router = APIRouter(prefix="/monitoring", tags=["AI Monitoring"])


class CreateMonitoringJobRequest(BaseModel):
    project_id: str
    name: str
    schedule: str = "0 9 * * *"  # Daily at 9am
    prompts: list[str]
    target_models: list[str] = ["claude-sonnet-4-6", "gpt-4o"]
    alert_on_rank_drop: bool = True
    alert_on_new_competitor: bool = True
    rank_drop_threshold: int = 3


class MonitoringJobResponse(BaseModel):
    id: str
    project_id: str
    name: str
    is_active: bool
    schedule: str
    prompts: list
    target_models: list
    last_run_at: str | None
    last_run_status: str | None
    created_at: str

    model_config = {"from_attributes": True}

    def model_post_init(self, __context):
        if hasattr(self, "created_at") and self.created_at:
            self.created_at = str(self.created_at)


class AlertResponse(BaseModel):
    id: str
    job_id: str
    project_id: str
    severity: str
    alert_type: str
    title: str
    description: str | None
    prompt: str | None
    llm_model: str | None
    previous_value: float | None
    current_value: float | None
    is_read: bool
    is_resolved: bool
    created_at: str

    model_config = {"from_attributes": True}

    def model_post_init(self, __context):
        if hasattr(self, "created_at") and self.created_at:
            self.created_at = str(self.created_at)


@router.post("/jobs", response_model=MonitoringJobResponse, status_code=201)
async def create_monitoring_job(
    payload: CreateMonitoringJobRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new monitoring job for continuous AI answer tracking."""
    job = MonitoringJob(**payload.model_dump())
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job


@router.get("/{project_id}/jobs", response_model=list[MonitoringJobResponse])
async def list_monitoring_jobs(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List monitoring jobs for a project."""
    result = await db.execute(
        select(MonitoringJob).where(MonitoringJob.project_id == project_id)
    )
    return result.scalars().all()


@router.patch("/jobs/{job_id}/toggle")
async def toggle_monitoring_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pause or resume a monitoring job."""
    result = await db.execute(select(MonitoringJob).where(MonitoringJob.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Monitoring job not found")

    job.is_active = not job.is_active
    await db.commit()
    return {"job_id": job_id, "is_active": job.is_active}


@router.post("/jobs/{job_id}/run-now", status_code=202)
async def run_monitoring_now(
    job_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger a monitoring job immediately."""
    result = await db.execute(select(MonitoringJob).where(MonitoringJob.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Monitoring job not found")

    background_tasks.add_task(_dispatch_monitoring_run, job_id=job_id)
    return {"message": "Monitoring run started", "job_id": job_id}


@router.get("/{project_id}/alerts", response_model=list[AlertResponse])
async def get_alerts(
    project_id: str,
    unread_only: bool = False,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get monitoring alerts for a project."""
    query = (
        select(MonitoringAlert)
        .where(MonitoringAlert.project_id == project_id)
        .order_by(MonitoringAlert.created_at.desc())
        .limit(limit)
    )
    if unread_only:
        query = query.where(MonitoringAlert.is_read == False)
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/alerts/{alert_id}/read")
async def mark_alert_read(
    alert_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark an alert as read."""
    result = await db.execute(select(MonitoringAlert).where(MonitoringAlert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    await db.commit()
    return {"alert_id": alert_id, "is_read": True}


@router.get("/{project_id}/alerts/unread-count")
async def get_unread_count(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get count of unread alerts."""
    from sqlalchemy import func
    result = await db.execute(
        select(func.count(MonitoringAlert.id)).where(
            MonitoringAlert.project_id == project_id,
            MonitoringAlert.is_read == False,
        )
    )
    count = result.scalar()
    return {"count": count}


def _dispatch_monitoring_run(job_id: str):
    try:
        from app.workers.tasks import run_monitoring_task
        run_monitoring_task.delay(job_id)
    except Exception:
        pass
