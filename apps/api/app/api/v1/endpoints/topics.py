"""Topic graph and ecosystem mapping endpoints."""
from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.topic import TopicEdge, TopicNode
from app.models.user import User

router = APIRouter(prefix="/topics", tags=["Topic Graph"])


class TopicNodeResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None
    parent_id: str | None
    depth: int
    is_covered: bool
    coverage_score: float | None
    importance_score: float | None
    node_type: str
    related_prompts: list
    competitor_coverage: dict

    model_config = {"from_attributes": True}


class TopicEdgeResponse(BaseModel):
    id: str
    source_id: str
    target_id: str
    relationship_type: str
    weight: float

    model_config = {"from_attributes": True}


class GenerateTopicGraphRequest(BaseModel):
    project_id: str
    product_name: str
    product_category: str
    depth: int = 3


@router.post("/generate", status_code=202)
async def generate_topic_graph(
    payload: GenerateTopicGraphRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate the topic ecosystem graph for a project."""
    background_tasks.add_task(
        _dispatch_topic_graph_generation,
        project_id=payload.project_id,
        product_name=payload.product_name,
        product_category=payload.product_category,
        depth=payload.depth,
    )
    return {"message": "Topic graph generation started"}


@router.get("/{project_id}/graph")
async def get_topic_graph(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the complete topic graph for visualization."""
    nodes_result = await db.execute(
        select(TopicNode).where(TopicNode.project_id == project_id)
    )
    edges_result = await db.execute(
        select(TopicEdge).where(TopicEdge.project_id == project_id)
    )

    nodes = nodes_result.scalars().all()
    edges = edges_result.scalars().all()

    return {
        "nodes": [
            {
                "id": n.id,
                "label": n.name,
                "slug": n.slug,
                "type": n.node_type,
                "covered": n.is_covered,
                "coverage_score": n.coverage_score,
                "importance_score": n.importance_score,
                "depth": n.depth,
                "parent_id": n.parent_id,
                "competitor_coverage": n.competitor_coverage,
                "related_prompts": n.related_prompts,
                "x": n.graph_x,
                "y": n.graph_y,
            }
            for n in nodes
        ],
        "edges": [
            {
                "id": e.id,
                "source": e.source_id,
                "target": e.target_id,
                "type": e.relationship_type,
                "weight": e.weight,
            }
            for e in edges
        ],
        "stats": {
            "total_topics": len(nodes),
            "covered_topics": sum(1 for n in nodes if n.is_covered),
            "gap_topics": sum(1 for n in nodes if not n.is_covered),
            "coverage_percentage": (
                sum(1 for n in nodes if n.is_covered) / len(nodes) * 100
                if nodes else 0
            ),
        },
    }


@router.get("/{project_id}/gaps")
async def get_content_gaps(
    project_id: str,
    min_importance: float = 5.0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get uncovered high-importance topics (content gaps)."""
    result = await db.execute(
        select(TopicNode).where(
            TopicNode.project_id == project_id,
            TopicNode.is_covered == False,
            TopicNode.importance_score >= min_importance,
        ).order_by(TopicNode.importance_score.desc())
    )
    gaps = result.scalars().all()

    return {
        "gaps": [
            {
                "id": g.id,
                "topic": g.name,
                "importance_score": g.importance_score,
                "related_prompts": g.related_prompts,
                "competitor_coverage": g.competitor_coverage,
                "node_type": g.node_type,
            }
            for g in gaps
        ]
    }


@router.get("/{project_id}/nodes", response_model=list[TopicNodeResponse])
async def list_topic_nodes(
    project_id: str,
    node_type: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List topic nodes for a project."""
    query = select(TopicNode).where(TopicNode.project_id == project_id)
    if node_type:
        query = query.where(TopicNode.node_type == node_type)
    result = await db.execute(query)
    return result.scalars().all()


def _dispatch_topic_graph_generation(
    project_id: str, product_name: str, product_category: str, depth: int
):
    try:
        from app.workers.tasks import generate_topic_graph_task
        generate_topic_graph_task.delay(project_id, product_name, product_category, depth)
    except Exception:
        pass
