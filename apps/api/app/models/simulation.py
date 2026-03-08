"""LLM simulation job and result models."""
from __future__ import annotations

import enum

from sqlalchemy import JSON, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class SimulationStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class LLMProvider(str, enum.Enum):
    anthropic = "anthropic"
    openai = "openai"
    google = "google"
    xai = "xai"
    perplexity = "perplexity"


class SimulationJob(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "simulation_jobs"

    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True
    )
    name: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[SimulationStatus] = mapped_column(
        Enum(SimulationStatus), default=SimulationStatus.pending, nullable=False, index=True
    )

    # Prompts to evaluate (list of strings)
    prompts: Mapped[list] = mapped_column(JSON, default=list)

    # Target LLM models to test
    target_models: Mapped[list] = mapped_column(JSON, default=list)

    # Task id for async processing
    task_id: Mapped[str | None] = mapped_column(String(255))
    error_message: Mapped[str | None] = mapped_column(Text)

    # Aggregate metrics (calculated after all results are in)
    summary: Mapped[dict] = mapped_column(JSON, default=dict)

    # Relationships
    project: Mapped = relationship("Project", back_populates="simulation_jobs")
    results: Mapped[list[SimulationResult]] = relationship(
        "SimulationResult", back_populates="job", cascade="all, delete-orphan"
    )


class SimulationResult(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "simulation_results"

    job_id: Mapped[str] = mapped_column(
        ForeignKey("simulation_jobs.id"), nullable=False, index=True
    )
    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True
    )

    # The prompt tested
    prompt: Mapped[str] = mapped_column(Text, nullable=False)

    # LLM model that generated this response
    llm_provider: Mapped[LLMProvider] = mapped_column(Enum(LLMProvider), nullable=False)
    llm_model: Mapped[str] = mapped_column(String(100), nullable=False)

    # Raw LLM response
    response_text: Mapped[str | None] = mapped_column(Text)

    # Extracted signals
    product_mentioned: Mapped[bool | None] = mapped_column(default=None)
    mention_rank: Mapped[int | None] = mapped_column(Integer)  # 1-based position
    mention_context: Mapped[str | None] = mapped_column(Text)
    sentiment_score: Mapped[float | None] = mapped_column(Float)  # -1 to 1
    confidence_score: Mapped[float | None] = mapped_column(Float)

    # All entities/products mentioned in the response
    entities_mentioned: Mapped[list] = mapped_column(JSON, default=list)

    # Competitors detected in response
    competitors_mentioned: Mapped[list] = mapped_column(JSON, default=list)

    # Citation/source signals
    citations: Mapped[list] = mapped_column(JSON, default=list)

    # Full structured extraction
    extraction: Mapped[dict] = mapped_column(JSON, default=dict)

    # Latency
    latency_ms: Mapped[int | None] = mapped_column(Integer)

    # Relationships
    job: Mapped[SimulationJob] = relationship("SimulationJob", back_populates="results")
