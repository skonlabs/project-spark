"""Content asset models — ingested documents, web pages, files."""
from __future__ import annotations

import enum

from sqlalchemy import JSON, Boolean, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class ContentSourceType(str, enum.Enum):
    file_upload = "file_upload"
    url = "url"
    github = "github"
    gitlab = "gitlab"
    google_drive = "google_drive"
    dropbox = "dropbox"
    wordpress = "wordpress"
    notion = "notion"
    confluence = "confluence"
    api = "api"
    sitemap = "sitemap"
    crawl = "crawl"


class ContentStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class ContentAsset(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "content_assets"

    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True
    )
    collection_id: Mapped[str | None] = mapped_column(
        ForeignKey("content_collections.id"), index=True
    )

    # Identity
    title: Mapped[str | None] = mapped_column(String(1024))
    source_url: Mapped[str | None] = mapped_column(Text)
    source_type: Mapped[ContentSourceType] = mapped_column(
        Enum(ContentSourceType), nullable=False
    )
    file_path: Mapped[str | None] = mapped_column(Text)  # S3 path
    file_type: Mapped[str | None] = mapped_column(String(50))  # pdf, docx, html, md…

    # Processing status
    status: Mapped[ContentStatus] = mapped_column(
        Enum(ContentStatus), default=ContentStatus.pending, nullable=False, index=True
    )
    error_message: Mapped[str | None] = mapped_column(Text)

    # Extracted content
    raw_text: Mapped[str | None] = mapped_column(Text)
    word_count: Mapped[int | None] = mapped_column(Integer)
    structured_data: Mapped[dict | None] = mapped_column(JSON)

    # Metadata
    metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    language: Mapped[str | None] = mapped_column(String(10))

    # NLP Analysis
    entities: Mapped[list] = mapped_column(JSON, default=list)  # detected named entities
    topics: Mapped[list] = mapped_column(JSON, default=list)    # detected topics
    intents: Mapped[list] = mapped_column(JSON, default=list)   # inferred intents
    sentiment: Mapped[float | None] = mapped_column(Float)       # -1 to 1

    # Semantic embedding (1536-dim for OpenAI, 384-dim for sentence-transformers)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(1536))

    # AEO Scores
    entity_clarity_score: Mapped[float | None] = mapped_column(Float)
    prompt_coverage_score: Mapped[float | None] = mapped_column(Float)
    structure_quality_score: Mapped[float | None] = mapped_column(Float)

    # Publishing
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    published_url: Mapped[str | None] = mapped_column(Text)
    published_at: Mapped[str | None] = mapped_column(String(50))

    # Relationships
    project: Mapped = relationship("Project", back_populates="content_assets")
    collection: Mapped = relationship("ContentCollection", back_populates="assets")

    def __repr__(self) -> str:
        return f"<ContentAsset {self.title or self.source_url}>"


class ContentCollection(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "content_collections"

    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[list] = mapped_column(JSON, default=list)

    # Relationships
    assets: Mapped[list[ContentAsset]] = relationship(
        "ContentAsset", back_populates="collection"
    )
