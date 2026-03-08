"""Analysis report models — AI Visibility Score and detailed breakdowns."""
from __future__ import annotations

import enum

from sqlalchemy import JSON, Enum, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class AnalysisStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class AnalysisReport(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "analysis_reports"

    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True
    )
    status: Mapped[AnalysisStatus] = mapped_column(
        Enum(AnalysisStatus), default=AnalysisStatus.pending, nullable=False, index=True
    )
    error_message: Mapped[str | None] = mapped_column(Text)

    # Overall score
    overall_score: Mapped[float | None] = mapped_column(Float)

    # Component scores (all 0-100)
    entity_clarity_score: Mapped[float | None] = mapped_column(Float)
    category_ownership_score: Mapped[float | None] = mapped_column(Float)
    educational_authority_score: Mapped[float | None] = mapped_column(Float)
    prompt_coverage_score: Mapped[float | None] = mapped_column(Float)
    comparison_coverage_score: Mapped[float | None] = mapped_column(Float)
    ecosystem_coverage_score: Mapped[float | None] = mapped_column(Float)
    external_authority_score: Mapped[float | None] = mapped_column(Float)
    community_signal_score: Mapped[float | None] = mapped_column(Float)
    consistency_score: Mapped[float | None] = mapped_column(Float)
    structure_quality_score: Mapped[float | None] = mapped_column(Float)

    # Detailed findings
    findings: Mapped[dict] = mapped_column(JSON, default=dict)

    # Actionable recommendations
    recommendations: Mapped[list] = mapped_column(JSON, default=list)

    # Content gaps
    content_gaps: Mapped[list] = mapped_column(JSON, default=list)

    # Prompt clusters identified
    prompt_clusters: Mapped[dict] = mapped_column(JSON, default=dict)

    # Content roadmap
    content_roadmap: Mapped[list] = mapped_column(JSON, default=list)

    # Raw LLM analysis output
    raw_analysis: Mapped[dict] = mapped_column(JSON, default=dict)

    # Celery task id for async tracking
    task_id: Mapped[str | None] = mapped_column(String(255))

    # Relationships
    project: Mapped = relationship("Project", back_populates="analysis_reports")
    scores: Mapped[list[AnalysisScore]] = relationship(
        "AnalysisScore", back_populates="report", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<AnalysisReport project={self.project_id} score={self.overall_score}>"


class AnalysisScore(Base, UUIDMixin, TimestampMixin):
    """Historical score snapshot — enables trend tracking."""
    __tablename__ = "analysis_scores"

    report_id: Mapped[str] = mapped_column(
        ForeignKey("analysis_reports.id"), nullable=False, index=True
    )
    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True
    )
    score_type: Mapped[str] = mapped_column(String(100), nullable=False)
    score_value: Mapped[float] = mapped_column(Float, nullable=False)
    metadata: Mapped[dict] = mapped_column(JSON, default=dict)

    report: Mapped[AnalysisReport] = relationship("AnalysisReport", back_populates="scores")
