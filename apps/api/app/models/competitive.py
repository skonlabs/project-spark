"""Competitive analysis models."""
from __future__ import annotations

from sqlalchemy import JSON, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Competitor(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "competitors"

    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    website_url: Mapped[str | None] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)

    # Latest competitive metrics
    llm_share_of_voice: Mapped[float | None] = mapped_column(Float)  # 0-100%
    avg_mention_rank: Mapped[float | None] = mapped_column(Float)
    mention_frequency: Mapped[float | None] = mapped_column(Float)
    avg_sentiment: Mapped[float | None] = mapped_column(Float)

    # Relationships
    project: Mapped = relationship("Project", back_populates="competitors")
    reports: Mapped[list[CompetitiveReport]] = relationship(
        "CompetitiveReport", back_populates="competitor", cascade="all, delete-orphan"
    )


class CompetitiveReport(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "competitive_reports"

    competitor_id: Mapped[str] = mapped_column(
        ForeignKey("competitors.id"), nullable=False, index=True
    )
    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True
    )

    # Share of voice across tested prompts (0-100%)
    share_of_voice: Mapped[float | None] = mapped_column(Float)

    # Rank distribution: {rank_1: count, rank_2: count, ...}
    rank_distribution: Mapped[dict] = mapped_column(JSON, default=dict)

    # Mention frequency as percentage of prompts where mentioned
    mention_frequency: Mapped[float | None] = mapped_column(Float)

    # Average sentiment across all mentions
    avg_sentiment: Mapped[float | None] = mapped_column(Float)

    # Prompt-level breakdown
    prompt_results: Mapped[list] = mapped_column(JSON, default=list)

    # Topic areas where competitor dominates
    dominant_topics: Mapped[list] = mapped_column(JSON, default=list)

    # Content gap analysis vs this competitor
    content_gaps: Mapped[list] = mapped_column(JSON, default=list)

    competitor: Mapped[Competitor] = relationship("Competitor", back_populates="reports")
