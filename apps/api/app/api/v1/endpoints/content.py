"""Content optimization and generation endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.content_optimizer import content_optimizer

router = APIRouter(prefix="/content", tags=["Content Optimization"])


class OptimizeRequest(BaseModel):
    content: str = Field(min_length=50)
    product_name: str
    product_category: str
    target_prompts: list[str] | None = None


class GenerateArticleRequest(BaseModel):
    topic: str
    product_name: str
    product_category: str
    target_audience: str = "professionals"
    word_count: int = Field(default=1500, ge=500, le=5000)


class GenerateComparisonRequest(BaseModel):
    product_name: str
    competitor_name: str
    product_category: str
    product_description: str
    competitor_description: str = ""


class GenerateFAQRequest(BaseModel):
    product_name: str
    product_category: str
    product_description: str
    num_questions: int = Field(default=15, ge=5, le=30)


class PromptAlignedRequest(BaseModel):
    prompt_cluster: str
    target_prompts: list[str] = Field(min_length=1)
    product_name: str
    product_category: str
    product_description: str


class EntityDefinitionRequest(BaseModel):
    product_name: str
    current_description: str
    product_category: str
    target_audience: str = "professionals"


@router.post("/optimize")
async def optimize_content(
    payload: OptimizeRequest,
    current_user: User = Depends(get_current_user),
):
    """Rewrite existing content for maximum AEO impact."""
    result = await content_optimizer.rewrite_for_aeo(
        original_content=payload.content,
        product_name=payload.product_name,
        product_category=payload.product_category,
        target_prompts=payload.target_prompts,
    )
    return result


@router.post("/generate/article")
async def generate_educational_article(
    payload: GenerateArticleRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate an AI-optimized educational article."""
    result = await content_optimizer.generate_educational_article(
        topic=payload.topic,
        product_name=payload.product_name,
        product_category=payload.product_category,
        target_audience=payload.target_audience,
        word_count=payload.word_count,
    )
    return result


@router.post("/generate/comparison")
async def generate_comparison_article(
    payload: GenerateComparisonRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a product comparison article optimized for 'X vs Y' prompts."""
    result = await content_optimizer.generate_comparison_article(
        product_name=payload.product_name,
        competitor_name=payload.competitor_name,
        product_category=payload.product_category,
        product_description=payload.product_description,
        competitor_description=payload.competitor_description,
    )
    return result


@router.post("/generate/faq")
async def generate_faq(
    payload: GenerateFAQRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a comprehensive FAQ page."""
    result = await content_optimizer.generate_faq_content(
        product_name=payload.product_name,
        product_category=payload.product_category,
        product_description=payload.product_description,
        num_questions=payload.num_questions,
    )
    return result


@router.post("/generate/prompt-aligned")
async def generate_prompt_aligned_content(
    payload: PromptAlignedRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate content specifically designed to answer a cluster of AI prompts."""
    result = await content_optimizer.generate_prompt_aligned_content(
        prompt_cluster=payload.prompt_cluster,
        target_prompts=payload.target_prompts,
        product_name=payload.product_name,
        product_category=payload.product_category,
        product_description=payload.product_description,
    )
    return result


@router.post("/generate/entity-definition")
async def generate_entity_definition(
    payload: EntityDefinitionRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate optimized entity definition statements for maximum LLM recognition."""
    result = await content_optimizer.optimize_entity_definition(
        product_name=payload.product_name,
        current_description=payload.current_description,
        product_category=payload.product_category,
        target_audience=payload.target_audience,
    )
    return result
