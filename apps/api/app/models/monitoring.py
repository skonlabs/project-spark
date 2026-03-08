"""AI Answer monitoring models."""
from __future__ import annotations

import enum

from sqlalchemy import JSON, Boolean, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class AlertSeverity(str, enum.Enum):
    info = "info"
    warning = "warning"
    critical = "critical"


class MonitoringJob(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "monitoring_jobs"

    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Cron schedule (e.g., "0 9 * * *" = daily at 9am)
    schedule: Mapped[str] = mapped_column(String(100), nullable=False, default="0 9 * * *")

    # Prompts to monitor (list of strings)
    prompts: Mapped[list] = mapped_column(JSON, default=list)

    # Target LLM models to monitor
    target_models: Mapped[list] = mapped_column(JSON, default=list)

    # Last run metadata
    last_run_at: Mapped[str | None] = mapped_column(String(50))
    last_run_status: Mapped[str | None] = mapped_column(String(50))

    # Alert thresholds
    alert_on_rank_drop: Mapped[bool] = mapped_column(Boolean, default=True)
    alert_on_new_competitor: Mapped[bool] = mapped_column(Boolean, default=True)
    alert_on_sentiment_change: Mapped[bool] = mapped_column(Boolean, default=False)
    rank_drop_threshold: Mapped[int] = mapped_column(Integer, default=3)

    # Relationships
    project: Mapped = relationship("Project", back_populates="monitoring_jobs")
    alerts: Mapped[list[MonitoringAlert]] = relationship(
        "MonitoringAlert", back_populates="job", cascade="all, delete-orphan"
    )


class MonitoringAlert(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "monitoring_alerts"

    job_id: Mapped[str] = mapped_column(
        ForeignKey("monitoring_jobs.id"), nullable=False, index=True
    )
    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True
    )

    severity: Mapped[AlertSeverity] = mapped_column(
        Enum(AlertSeverity), nullable=False, default=AlertSeverity.info
    )
    alert_type: Mapped[str] = mapped_column(String(100), nullable=False)
    # e.g.: "rank_drop", "competitor_appeared", "visibility_improved", "sentiment_change"

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    # Context data
    prompt: Mapped[str | None] = mapped_column(Text)
    llm_model: Mapped[str | None] = mapped_column(String(100))
    previous_value: Mapped[float | None] = mapped_column(Float)
    current_value: Mapped[float | None] = mapped_column(Float)
    metadata: Mapped[dict] = mapped_column(JSON, default=dict)

    # Status
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    job: Mapped[MonitoringJob] = relationship("MonitoringJob", back_populates="alerts")
