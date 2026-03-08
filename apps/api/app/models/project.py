"""Project model — core unit of AEO analysis."""
from __future__ import annotations

from sqlalchemy import JSON, Boolean, ForeignKey, Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Project(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "projects"

    workspace_id: Mapped[str] = mapped_column(
        ForeignKey("workspaces.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    product_description: Mapped[str | None] = mapped_column(Text)
    product_url: Mapped[str | None] = mapped_column(String(2048))
    product_category: Mapped[str | None] = mapped_column(String(255))
    target_audience: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # AI Visibility Score (0-100)
    visibility_score: Mapped[float | None] = mapped_column(Float)
    score_breakdown: Mapped[dict | None] = mapped_column(JSON)

    # Configuration
    settings: Mapped[dict] = mapped_column(JSON, default=dict)
    target_llms: Mapped[list] = mapped_column(JSON, default=list)
    monitoring_prompts: Mapped[list] = mapped_column(JSON, default=list)

    # Relationships
    workspace: Mapped = relationship("Workspace", back_populates="projects")
    content_assets: Mapped[list] = relationship(
        "ContentAsset", back_populates="project", cascade="all, delete-orphan"
    )
    analysis_reports: Mapped[list] = relationship(
        "AnalysisReport", back_populates="project", cascade="all, delete-orphan"
    )
    simulation_jobs: Mapped[list] = relationship(
        "SimulationJob", back_populates="project", cascade="all, delete-orphan"
    )
    competitors: Mapped[list] = relationship(
        "Competitor", back_populates="project", cascade="all, delete-orphan"
    )
    topic_nodes: Mapped[list] = relationship(
        "TopicNode", back_populates="project", cascade="all, delete-orphan"
    )
    monitoring_jobs: Mapped[list] = relationship(
        "MonitoringJob", back_populates="project", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Project {self.name}>"
