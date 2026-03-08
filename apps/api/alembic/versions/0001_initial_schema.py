"""Initial database schema.

Revision ID: 0001
Revises:
Create Date: 2026-03-08 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # Users
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("full_name", sa.String(255)),
        sa.Column("avatar_url", sa.Text),
        sa.Column("hashed_password", sa.String(255)),
        sa.Column("google_id", sa.String(255), unique=True),
        sa.Column("microsoft_id", sa.String(255), unique=True),
        sa.Column("okta_id", sa.String(255), unique=True),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("is_superuser", sa.Boolean, default=False, nullable=False),
        sa.Column("is_verified", sa.Boolean, default=False, nullable=False),
        sa.Column("plan", sa.String(50), default="free", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Workspaces
    op.create_table(
        "workspaces",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("description", sa.Text),
        sa.Column("logo_url", sa.Text),
        sa.Column("owner_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("plan", sa.String(50), default="free", nullable=False),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Workspace members
    op.create_table(
        "workspace_members",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), sa.ForeignKey("workspaces.id"), nullable=False, index=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("role", sa.String(50), nullable=False, default="viewer"),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Projects
    op.create_table(
        "projects",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), sa.ForeignKey("workspaces.id"), nullable=False, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("product_name", sa.String(255), nullable=False),
        sa.Column("product_description", sa.Text),
        sa.Column("product_url", sa.String(2048)),
        sa.Column("product_category", sa.String(255)),
        sa.Column("target_audience", sa.Text),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("visibility_score", sa.Float),
        sa.Column("score_breakdown", JSON),
        sa.Column("settings", JSON, default=dict),
        sa.Column("target_llms", JSON, default=list),
        sa.Column("monitoring_prompts", JSON, default=list),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Content collections
    op.create_table(
        "content_collections",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("projects.id"), nullable=False, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("tags", JSON, default=list),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Content assets
    op.create_table(
        "content_assets",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("projects.id"), nullable=False, index=True),
        sa.Column("collection_id", sa.String(36), sa.ForeignKey("content_collections.id"), index=True),
        sa.Column("title", sa.String(1024)),
        sa.Column("source_url", sa.Text),
        sa.Column("source_type", sa.String(50), nullable=False),
        sa.Column("file_path", sa.Text),
        sa.Column("file_type", sa.String(50)),
        sa.Column("status", sa.String(50), nullable=False, default="pending", index=True),
        sa.Column("error_message", sa.Text),
        sa.Column("raw_text", sa.Text),
        sa.Column("word_count", sa.Integer),
        sa.Column("structured_data", JSON),
        sa.Column("metadata", JSON, default=dict),
        sa.Column("tags", JSON, default=list),
        sa.Column("language", sa.String(10)),
        sa.Column("entities", JSON, default=list),
        sa.Column("topics", JSON, default=list),
        sa.Column("intents", JSON, default=list),
        sa.Column("sentiment", sa.Float),
        sa.Column("embedding", sa.Text),  # Will be vector(1536) via raw SQL
        sa.Column("entity_clarity_score", sa.Float),
        sa.Column("prompt_coverage_score", sa.Float),
        sa.Column("structure_quality_score", sa.Float),
        sa.Column("is_published", sa.Boolean, default=False),
        sa.Column("published_url", sa.Text),
        sa.Column("published_at", sa.String(50)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Analysis reports
    op.create_table(
        "analysis_reports",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("projects.id"), nullable=False, index=True),
        sa.Column("status", sa.String(50), nullable=False, default="pending", index=True),
        sa.Column("error_message", sa.Text),
        sa.Column("overall_score", sa.Float),
        sa.Column("entity_clarity_score", sa.Float),
        sa.Column("category_ownership_score", sa.Float),
        sa.Column("educational_authority_score", sa.Float),
        sa.Column("prompt_coverage_score", sa.Float),
        sa.Column("comparison_coverage_score", sa.Float),
        sa.Column("ecosystem_coverage_score", sa.Float),
        sa.Column("external_authority_score", sa.Float),
        sa.Column("community_signal_score", sa.Float),
        sa.Column("consistency_score", sa.Float),
        sa.Column("structure_quality_score", sa.Float),
        sa.Column("findings", JSON, default=dict),
        sa.Column("recommendations", JSON, default=list),
        sa.Column("content_gaps", JSON, default=list),
        sa.Column("prompt_clusters", JSON, default=dict),
        sa.Column("content_roadmap", JSON, default=list),
        sa.Column("raw_analysis", JSON, default=dict),
        sa.Column("task_id", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Analysis scores (historical)
    op.create_table(
        "analysis_scores",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("report_id", sa.String(36), sa.ForeignKey("analysis_reports.id"), nullable=False, index=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("projects.id"), nullable=False, index=True),
        sa.Column("score_type", sa.String(100), nullable=False),
        sa.Column("score_value", sa.Float, nullable=False),
        sa.Column("metadata", JSON, default=dict),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Simulation jobs
    op.create_table(
        "simulation_jobs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("projects.id"), nullable=False, index=True),
        sa.Column("name", sa.String(255)),
        sa.Column("status", sa.String(50), nullable=False, default="pending", index=True),
        sa.Column("prompts", JSON, default=list),
        sa.Column("target_models", JSON, default=list),
        sa.Column("task_id", sa.String(255)),
        sa.Column("error_message", sa.Text),
        sa.Column("summary", JSON, default=dict),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Simulation results
    op.create_table(
        "simulation_results",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("job_id", sa.String(36), sa.ForeignKey("simulation_jobs.id"), nullable=False, index=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("projects.id"), nullable=False, index=True),
        sa.Column("prompt", sa.Text, nullable=False),
        sa.Column("llm_provider", sa.String(50), nullable=False),
        sa.Column("llm_model", sa.String(100), nullable=False),
        sa.Column("response_text", sa.Text),
        sa.Column("product_mentioned", sa.Boolean),
        sa.Column("mention_rank", sa.Integer),
        sa.Column("mention_context", sa.Text),
        sa.Column("sentiment_score", sa.Float),
        sa.Column("confidence_score", sa.Float),
        sa.Column("entities_mentioned", JSON, default=list),
        sa.Column("competitors_mentioned", JSON, default=list),
        sa.Column("citations", JSON, default=list),
        sa.Column("extraction", JSON, default=dict),
        sa.Column("latency_ms", sa.Integer),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Competitors
    op.create_table(
        "competitors",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("projects.id"), nullable=False, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("website_url", sa.Text),
        sa.Column("description", sa.Text),
        sa.Column("llm_share_of_voice", sa.Float),
        sa.Column("avg_mention_rank", sa.Float),
        sa.Column("mention_frequency", sa.Float),
        sa.Column("avg_sentiment", sa.Float),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Competitive reports
    op.create_table(
        "competitive_reports",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("competitor_id", sa.String(36), sa.ForeignKey("competitors.id"), nullable=False, index=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("projects.id"), nullable=False, index=True),
        sa.Column("share_of_voice", sa.Float),
        sa.Column("rank_distribution", JSON, default=dict),
        sa.Column("mention_frequency", sa.Float),
        sa.Column("avg_sentiment", sa.Float),
        sa.Column("prompt_results", JSON, default=list),
        sa.Column("dominant_topics", JSON, default=list),
        sa.Column("content_gaps", JSON, default=list),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Topic nodes
    op.create_table(
        "topic_nodes",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("projects.id"), nullable=False, index=True),
        sa.Column("name", sa.String(500), nullable=False),
        sa.Column("slug", sa.String(500), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("parent_id", sa.String(36), sa.ForeignKey("topic_nodes.id"), index=True),
        sa.Column("depth", sa.Integer, default=0, nullable=False),
        sa.Column("is_covered", sa.Boolean, default=False, nullable=False),
        sa.Column("coverage_score", sa.Float),
        sa.Column("importance_score", sa.Float),
        sa.Column("competitor_coverage", JSON, default=dict),
        sa.Column("related_prompts", JSON, default=list),
        sa.Column("covering_assets", JSON, default=list),
        sa.Column("graph_x", sa.Float),
        sa.Column("graph_y", sa.Float),
        sa.Column("node_type", sa.String(50), default="core", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Topic edges
    op.create_table(
        "topic_edges",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("projects.id"), nullable=False, index=True),
        sa.Column("source_id", sa.String(36), sa.ForeignKey("topic_nodes.id"), nullable=False, index=True),
        sa.Column("target_id", sa.String(36), sa.ForeignKey("topic_nodes.id"), nullable=False, index=True),
        sa.Column("relationship_type", sa.String(100), nullable=False),
        sa.Column("weight", sa.Float, default=1.0, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Monitoring jobs
    op.create_table(
        "monitoring_jobs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("projects.id"), nullable=False, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("schedule", sa.String(100), nullable=False, default="0 9 * * *"),
        sa.Column("prompts", JSON, default=list),
        sa.Column("target_models", JSON, default=list),
        sa.Column("last_run_at", sa.String(50)),
        sa.Column("last_run_status", sa.String(50)),
        sa.Column("alert_on_rank_drop", sa.Boolean, default=True),
        sa.Column("alert_on_new_competitor", sa.Boolean, default=True),
        sa.Column("alert_on_sentiment_change", sa.Boolean, default=False),
        sa.Column("rank_drop_threshold", sa.Integer, default=3),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Monitoring alerts
    op.create_table(
        "monitoring_alerts",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("job_id", sa.String(36), sa.ForeignKey("monitoring_jobs.id"), nullable=False, index=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("projects.id"), nullable=False, index=True),
        sa.Column("severity", sa.String(50), nullable=False, default="info"),
        sa.Column("alert_type", sa.String(100), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("prompt", sa.Text),
        sa.Column("llm_model", sa.String(100)),
        sa.Column("previous_value", sa.Float),
        sa.Column("current_value", sa.Float),
        sa.Column("metadata", JSON, default=dict),
        sa.Column("is_read", sa.Boolean, default=False, nullable=False),
        sa.Column("is_resolved", sa.Boolean, default=False, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Vector index for semantic search
    op.execute("""
        ALTER TABLE content_assets
        ADD COLUMN IF NOT EXISTS embedding vector(1536)
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS content_assets_embedding_idx
        ON content_assets USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
    """)


def downgrade() -> None:
    op.drop_table("monitoring_alerts")
    op.drop_table("monitoring_jobs")
    op.drop_table("topic_edges")
    op.drop_table("topic_nodes")
    op.drop_table("competitive_reports")
    op.drop_table("competitors")
    op.drop_table("simulation_results")
    op.drop_table("simulation_jobs")
    op.drop_table("analysis_scores")
    op.drop_table("analysis_reports")
    op.drop_table("content_assets")
    op.drop_table("content_collections")
    op.drop_table("projects")
    op.drop_table("workspace_members")
    op.drop_table("workspaces")
    op.drop_table("users")
