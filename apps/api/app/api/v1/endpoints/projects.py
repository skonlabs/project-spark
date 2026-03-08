"""Project CRUD endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.project import Project
from app.models.user import User
from app.models.workspace import WorkspaceMember

router = APIRouter(prefix="/projects", tags=["Projects"])


class ProjectCreate(BaseModel):
    workspace_id: str
    name: str = Field(max_length=255)
    description: str | None = None
    product_name: str = Field(max_length=255)
    product_description: str | None = None
    product_url: str | None = None
    product_category: str | None = None
    target_audience: str | None = None
    target_llms: list[str] = Field(default_factory=list)


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    product_name: str | None = None
    product_description: str | None = None
    product_url: str | None = None
    product_category: str | None = None
    target_audience: str | None = None
    target_llms: list[str] | None = None
    monitoring_prompts: list[str] | None = None


class ProjectResponse(BaseModel):
    id: str
    workspace_id: str
    name: str
    description: str | None
    product_name: str
    product_description: str | None
    product_url: str | None
    product_category: str | None
    target_audience: str | None
    visibility_score: float | None
    score_breakdown: dict | None
    target_llms: list
    monitoring_prompts: list
    is_active: bool
    created_at: str

    model_config = {"from_attributes": True}

    def model_post_init(self, __context):
        if hasattr(self, "created_at") and self.created_at:
            self.created_at = str(self.created_at)


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new AEO project."""
    # Verify workspace membership
    membership = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == payload.workspace_id,
            WorkspaceMember.user_id == current_user.id,
        )
    )
    if not membership.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    project = Project(**payload.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.get("/", response_model=list[ProjectResponse])
async def list_projects(
    workspace_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all projects in a workspace."""
    # Verify membership
    membership = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == current_user.id,
        )
    )
    if not membership.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    result = await db.execute(
        select(Project).where(
            Project.workspace_id == workspace_id,
            Project.is_active == True,
        )
    )
    return result.scalars().all()


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single project."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    payload: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update project settings."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(project, field, value)

    await db.commit()
    await db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Soft-delete a project."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    project.is_active = False
    await db.commit()
