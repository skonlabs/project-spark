"""LLM Simulation endpoints — run prompts across multiple LLMs."""
from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.project import Project
from app.models.simulation import SimulationJob, SimulationResult, SimulationStatus
from app.models.user import User

router = APIRouter(prefix="/simulation", tags=["LLM Simulation"])


AVAILABLE_MODELS = [
    "claude-opus-4-6",
    "claude-sonnet-4-6",
    "claude-haiku-4-5",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
]


class SimulationRunRequest(BaseModel):
    project_id: str
    name: str | None = None
    prompts: list[str] = Field(min_length=1, max_length=50)
    target_models: list[str] = Field(
        default=["claude-sonnet-4-6", "gpt-4o", "gemini-1.5-pro"]
    )


class SimulationJobResponse(BaseModel):
    id: str
    project_id: str
    name: str | None
    status: str
    prompts: list
    target_models: list
    summary: dict
    created_at: str

    model_config = {"from_attributes": True}

    def model_post_init(self, __context):
        if hasattr(self, "created_at") and self.created_at:
            self.created_at = str(self.created_at)


class SimulationResultResponse(BaseModel):
    id: str
    prompt: str
    llm_model: str
    llm_provider: str
    response_text: str | None
    product_mentioned: bool | None
    mention_rank: int | None
    mention_context: str | None
    sentiment_score: float | None
    confidence_score: float | None
    entities_mentioned: list
    competitors_mentioned: list
    latency_ms: int | None

    model_config = {"from_attributes": True}


@router.get("/models")
async def list_available_models():
    """List all available LLM models for simulation."""
    return {
        "models": [
            {"id": "claude-opus-4-6", "provider": "anthropic", "name": "Claude Opus 4.6"},
            {"id": "claude-sonnet-4-6", "provider": "anthropic", "name": "Claude Sonnet 4.6"},
            {"id": "claude-haiku-4-5", "provider": "anthropic", "name": "Claude Haiku 4.5"},
            {"id": "gpt-4o", "provider": "openai", "name": "GPT-4o"},
            {"id": "gpt-4o-mini", "provider": "openai", "name": "GPT-4o Mini"},
            {"id": "gemini-1.5-pro", "provider": "google", "name": "Gemini 1.5 Pro"},
            {"id": "gemini-1.5-flash", "provider": "google", "name": "Gemini 1.5 Flash"},
        ]
    }


@router.post("/run", status_code=status.HTTP_202_ACCEPTED)
async def run_simulation(
    payload: SimulationRunRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Start an LLM simulation job."""
    # Validate project
    project_result = await db.execute(
        select(Project).where(Project.id == payload.project_id)
    )
    project = project_result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Create simulation job
    job = SimulationJob(
        project_id=payload.project_id,
        name=payload.name or f"Simulation {len(payload.prompts)} prompts",
        status=SimulationStatus.pending,
        prompts=payload.prompts,
        target_models=payload.target_models,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # Dispatch
    background_tasks.add_task(
        _dispatch_simulation_task,
        job_id=job.id,
        project_id=payload.project_id,
        product_name=project.product_name,
        prompts=payload.prompts,
        target_models=payload.target_models,
    )

    return {
        "job_id": job.id,
        "status": "pending",
        "message": f"Simulation started — testing {len(payload.prompts)} prompts across {len(payload.target_models)} models.",
    }


@router.get("/{project_id}/jobs", response_model=list[SimulationJobResponse])
async def list_jobs(
    project_id: str,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List simulation jobs for a project."""
    result = await db.execute(
        select(SimulationJob)
        .where(SimulationJob.project_id == project_id)
        .order_by(SimulationJob.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/jobs/{job_id}", response_model=SimulationJobResponse)
async def get_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a simulation job with its summary."""
    result = await db.execute(select(SimulationJob).where(SimulationJob.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Simulation job not found")
    return job


@router.get("/jobs/{job_id}/results", response_model=list[SimulationResultResponse])
async def get_results(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all simulation results for a job."""
    result = await db.execute(
        select(SimulationResult).where(SimulationResult.job_id == job_id)
    )
    return result.scalars().all()


def _dispatch_simulation_task(
    job_id: str,
    project_id: str,
    product_name: str,
    prompts: list[str],
    target_models: list[str],
) -> None:
    try:
        from app.workers.tasks import run_simulation_task
        run_simulation_task.delay(
            job_id=job_id,
            project_id=project_id,
            product_name=product_name,
            prompts=prompts,
            target_models=target_models,
        )
    except Exception:
        pass
