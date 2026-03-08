"""Topic graph models — ecosystem mapping and gap detection."""
from __future__ import annotations

from sqlalchemy import JSON, Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class TopicNode(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "topic_nodes"

    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True
    )

    # Topic identity
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    # Hierarchy
    parent_id: Mapped[str | None] = mapped_column(ForeignKey("topic_nodes.id"), index=True)
    depth: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Coverage signals
    is_covered: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    coverage_score: Mapped[float | None] = mapped_column(Float)  # 0-100
    importance_score: Mapped[float | None] = mapped_column(Float)  # 0-100

    # Competitor coverage
    competitor_coverage: Mapped[dict] = mapped_column(JSON, default=dict)
    # e.g., {"CompetitorA": 85.0, "CompetitorB": 40.0}

    # Related prompts
    related_prompts: Mapped[list] = mapped_column(JSON, default=list)

    # Content assets covering this topic
    covering_assets: Mapped[list] = mapped_column(JSON, default=list)  # asset IDs

    # Graph visualization position
    graph_x: Mapped[float | None] = mapped_column(Float)
    graph_y: Mapped[float | None] = mapped_column(Float)

    # Node type: core | adjacent | gap
    node_type: Mapped[str] = mapped_column(String(50), default="core", nullable=False)

    # Relationships
    project: Mapped = relationship("Project", back_populates="topic_nodes")
    children: Mapped[list[TopicNode]] = relationship(
        "TopicNode", back_populates="parent"
    )
    parent: Mapped[TopicNode | None] = relationship(
        "TopicNode", back_populates="children", remote_side="TopicNode.id"
    )
    edges_from: Mapped[list[TopicEdge]] = relationship(
        "TopicEdge", back_populates="source_node",
        foreign_keys="TopicEdge.source_id",
        cascade="all, delete-orphan",
    )
    edges_to: Mapped[list[TopicEdge]] = relationship(
        "TopicEdge", back_populates="target_node",
        foreign_keys="TopicEdge.target_id",
        cascade="all, delete-orphan",
    )


class TopicEdge(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "topic_edges"

    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True
    )
    source_id: Mapped[str] = mapped_column(
        ForeignKey("topic_nodes.id"), nullable=False, index=True
    )
    target_id: Mapped[str] = mapped_column(
        ForeignKey("topic_nodes.id"), nullable=False, index=True
    )

    # Relationship type: relates_to | subtopic_of | requires | competes_with
    relationship_type: Mapped[str] = mapped_column(String(100), nullable=False)
    weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)

    source_node: Mapped[TopicNode] = relationship(
        "TopicNode", back_populates="edges_from", foreign_keys=[source_id]
    )
    target_node: Mapped[TopicNode] = relationship(
        "TopicNode", back_populates="edges_to", foreign_keys=[target_id]
    )
