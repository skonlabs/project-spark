"""
Celery background tasks — analysis, simulation, ingestion, monitoring.
"""
from __future__ import annotations

import asyncio
from typing import Any

from app.workers.celery_app import celery_app


def run_async(coro):
    """Run an async coroutine in a sync Celery task context."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


# ─── Analysis ─────────────────────────────────────────────────────────────────

@celery_app.task(name="app.workers.tasks.run_analysis_task", bind=True, max_retries=2)
def run_analysis_task(
    self,
    report_id: str,
    project_id: str,
    asset_ids: list[str] | None = None,
):
    """Run full AEO analysis pipeline for a project."""
    return run_async(_run_analysis(report_id, project_id, asset_ids))


async def _run_analysis(report_id: str, project_id: str, asset_ids: list[str] | None):
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.models.analysis import AnalysisReport, AnalysisStatus
    from app.models.content import ContentAsset, ContentStatus
    from app.models.competitive import Competitor
    from app.models.project import Project
    from app.services.analysis_engine import analysis_engine

    async with AsyncSessionLocal() as db:
        # Update status to running
        result = await db.execute(select(AnalysisReport).where(AnalysisReport.id == report_id))
        report = result.scalar_one_or_none()
        if not report:
            return

        report.status = AnalysisStatus.running
        await db.commit()

        try:
            # Load project
            proj_result = await db.execute(select(Project).where(Project.id == project_id))
            project = proj_result.scalar_one_or_none()
            if not project:
                raise ValueError("Project not found")

            # Load content assets
            query = select(ContentAsset).where(
                ContentAsset.project_id == project_id,
                ContentAsset.status == ContentStatus.completed,
            )
            if asset_ids:
                query = query.where(ContentAsset.id.in_(asset_ids))
            assets_result = await db.execute(query)
            assets = assets_result.scalars().all()

            content_corpus = [
                {
                    "title": a.title,
                    "text": a.raw_text or "",
                    "url": a.source_url,
                }
                for a in assets
                if a.raw_text
            ]

            # Load competitors
            comp_result = await db.execute(
                select(Competitor).where(Competitor.project_id == project_id)
            )
            competitors = [c.name for c in comp_result.scalars().all()]

            # Run analysis
            analysis_result = await analysis_engine.analyze(
                product_name=project.product_name,
                product_description=project.product_description or "",
                product_category=project.product_category or "",
                content_corpus=content_corpus,
                competitors=competitors,
            )

            # Update report
            scores = analysis_result["scores"]
            report.status = AnalysisStatus.completed
            report.overall_score = scores["overall"]
            report.entity_clarity_score = scores.get("entity_clarity")
            report.category_ownership_score = scores.get("category_ownership")
            report.educational_authority_score = scores.get("educational_authority")
            report.prompt_coverage_score = scores.get("prompt_coverage")
            report.comparison_coverage_score = scores.get("comparison_coverage")
            report.ecosystem_coverage_score = scores.get("ecosystem_coverage")
            report.external_authority_score = scores.get("external_authority")
            report.community_signal_score = scores.get("community_signal")
            report.consistency_score = scores.get("consistency")
            report.structure_quality_score = scores.get("structure_quality")
            report.findings = analysis_result["findings"]
            report.recommendations = analysis_result["recommendations"]
            report.content_gaps = analysis_result["content_gaps"]
            report.prompt_clusters = analysis_result["prompt_clusters"]
            report.content_roadmap = analysis_result["content_roadmap"]

            # Update project visibility score
            project.visibility_score = scores["overall"]
            project.score_breakdown = scores

            await db.commit()

        except Exception as exc:
            report.status = AnalysisStatus.failed
            report.error_message = str(exc)
            await db.commit()
            raise


# ─── Simulation ───────────────────────────────────────────────────────────────

@celery_app.task(name="app.workers.tasks.run_simulation_task", bind=True, max_retries=2)
def run_simulation_task(
    self,
    job_id: str,
    project_id: str,
    product_name: str,
    prompts: list[str],
    target_models: list[str],
):
    """Run LLM simulation across multiple models."""
    return run_async(_run_simulation(job_id, project_id, product_name, prompts, target_models))


async def _run_simulation(
    job_id: str,
    project_id: str,
    product_name: str,
    prompts: list[str],
    target_models: list[str],
):
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.models.simulation import SimulationJob, SimulationResult, SimulationStatus, LLMProvider
    from app.models.competitive import Competitor
    from app.services.simulation_engine import simulation_engine

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(SimulationJob).where(SimulationJob.id == job_id))
        job = result.scalar_one_or_none()
        if not job:
            return

        job.status = SimulationStatus.running
        await db.commit()

        try:
            # Get competitors
            comp_result = await db.execute(
                select(Competitor).where(Competitor.project_id == project_id)
            )
            competitors = [c.name for c in comp_result.scalars().all()]

            sim_result = await simulation_engine.run_simulation(
                prompts=prompts,
                product_name=product_name,
                target_models=target_models,
                competitors=competitors,
            )

            # Store individual results
            for r in sim_result["results"]:
                sim_result_obj = SimulationResult(
                    job_id=job_id,
                    project_id=project_id,
                    prompt=r["prompt"],
                    llm_provider=LLMProvider(r.get("provider", "anthropic")),
                    llm_model=r["model"],
                    response_text=r.get("response_text"),
                    product_mentioned=r.get("product_mentioned", False),
                    mention_rank=r.get("mention_rank"),
                    mention_context=r.get("mention_context"),
                    sentiment_score=r.get("sentiment_score"),
                    confidence_score=r.get("confidence_score"),
                    entities_mentioned=r.get("entities_mentioned", []),
                    competitors_mentioned=r.get("competitors_mentioned", []),
                    citations=r.get("citations", []),
                    latency_ms=r.get("latency_ms"),
                )
                db.add(sim_result_obj)

            job.status = SimulationStatus.completed
            job.summary = sim_result["summary"]
            await db.commit()

        except Exception as exc:
            job.status = SimulationStatus.failed
            job.error_message = str(exc)
            await db.commit()
            raise


# ─── Ingestion ────────────────────────────────────────────────────────────────

@celery_app.task(name="app.workers.tasks.process_file_upload_task")
def process_file_upload_task(asset_id: str, file_content: bytes, filename: str, content_type: str):
    return run_async(_process_file(asset_id, file_content, filename, content_type))


async def _process_file(asset_id: str, file_content: bytes, filename: str, content_type: str):
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.models.content import ContentAsset, ContentStatus
    from app.services.ingestion_engine import ingestion_engine

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(ContentAsset).where(ContentAsset.id == asset_id))
        asset = result.scalar_one_or_none()
        if not asset:
            return

        try:
            asset.status = ContentStatus.processing
            await db.commit()

            extraction = await ingestion_engine.ingest_file(file_content, filename, content_type)

            asset.title = extraction.title
            asset.raw_text = extraction.text
            asset.word_count = extraction.word_count
            asset.metadata = extraction.metadata
            asset.status = ContentStatus.completed

        except Exception as exc:
            asset.status = ContentStatus.failed
            asset.error_message = str(exc)

        await db.commit()


@celery_app.task(name="app.workers.tasks.process_url_ingest_task")
def process_url_ingest_task(asset_id: str, url: str):
    return run_async(_process_url(asset_id, url))


async def _process_url(asset_id: str, url: str):
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.models.content import ContentAsset, ContentStatus
    from app.services.ingestion_engine import ingestion_engine

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(ContentAsset).where(ContentAsset.id == asset_id))
        asset = result.scalar_one_or_none()
        if not asset:
            return

        try:
            asset.status = ContentStatus.processing
            await db.commit()

            extraction = await ingestion_engine.ingest_url(url)
            asset.title = extraction.title
            asset.raw_text = extraction.text
            asset.word_count = extraction.word_count
            asset.metadata = extraction.metadata
            asset.status = ContentStatus.completed

        except Exception as exc:
            asset.status = ContentStatus.failed
            asset.error_message = str(exc)

        await db.commit()


@celery_app.task(name="app.workers.tasks.process_sitemap_task")
def process_sitemap_task(project_id: str, sitemap_url: str, collection_id: str | None):
    return run_async(_process_sitemap(project_id, sitemap_url, collection_id))


async def _process_sitemap(project_id: str, sitemap_url: str, collection_id: str | None):
    from app.core.database import AsyncSessionLocal
    from app.models.content import ContentAsset, ContentSourceType, ContentStatus
    from app.services.ingestion_engine import ingestion_engine

    results = await ingestion_engine.ingest_sitemap(sitemap_url)

    async with AsyncSessionLocal() as db:
        for extraction in results:
            asset = ContentAsset(
                project_id=project_id,
                collection_id=collection_id,
                title=extraction.title,
                source_url=extraction.url,
                source_type=ContentSourceType.sitemap,
                status=ContentStatus.completed,
                raw_text=extraction.text,
                word_count=extraction.word_count,
                metadata=extraction.metadata,
                file_type="html",
            )
            db.add(asset)
        await db.commit()


@celery_app.task(name="app.workers.tasks.process_crawl_task")
def process_crawl_task(project_id: str, base_url: str, max_pages: int, collection_id: str | None):
    return run_async(_process_crawl(project_id, base_url, max_pages, collection_id))


async def _process_crawl(project_id: str, base_url: str, max_pages: int, collection_id: str | None):
    from app.core.database import AsyncSessionLocal
    from app.models.content import ContentAsset, ContentSourceType, ContentStatus
    from app.services.ingestion_engine import ingestion_engine

    results = await ingestion_engine.crawl_website(base_url, max_pages)

    async with AsyncSessionLocal() as db:
        for extraction in results:
            asset = ContentAsset(
                project_id=project_id,
                collection_id=collection_id,
                title=extraction.title,
                source_url=extraction.url,
                source_type=ContentSourceType.crawl,
                status=ContentStatus.completed,
                raw_text=extraction.text,
                word_count=extraction.word_count,
                metadata=extraction.metadata,
                file_type="html",
            )
            db.add(asset)
        await db.commit()


@celery_app.task(name="app.workers.tasks.process_github_ingest_task")
def process_github_ingest_task(
    project_id: str, repo_url: str, github_token: str | None,
    file_extensions: list[str], collection_id: str | None
):
    return run_async(_process_github(project_id, repo_url, github_token, file_extensions, collection_id))


async def _process_github(
    project_id: str, repo_url: str, github_token: str | None,
    file_extensions: list[str], collection_id: str | None
):
    from app.core.database import AsyncSessionLocal
    from app.models.content import ContentAsset, ContentSourceType, ContentStatus
    from app.services.ingestion_engine import ingestion_engine

    results = await ingestion_engine.ingest_github_repo(repo_url, github_token, file_extensions)

    async with AsyncSessionLocal() as db:
        for extraction in results:
            asset = ContentAsset(
                project_id=project_id,
                collection_id=collection_id,
                title=extraction.title,
                source_url=repo_url,
                source_type=ContentSourceType.github,
                status=ContentStatus.completed,
                raw_text=extraction.text,
                word_count=extraction.word_count,
                metadata=extraction.metadata,
            )
            db.add(asset)
        await db.commit()


# ─── Monitoring ───────────────────────────────────────────────────────────────

@celery_app.task(name="app.workers.tasks.run_monitoring_task")
def run_monitoring_task(job_id: str):
    return run_async(_run_monitoring(job_id))


async def _run_monitoring(job_id: str):
    from datetime import datetime
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.models.monitoring import MonitoringAlert, MonitoringJob, AlertSeverity
    from app.models.project import Project
    from app.services.simulation_engine import simulation_engine

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(MonitoringJob).where(MonitoringJob.id == job_id))
        job = result.scalar_one_or_none()
        if not job or not job.is_active:
            return

        proj_result = await db.execute(select(Project).where(Project.id == job.project_id))
        project = proj_result.scalar_one_or_none()
        if not project:
            return

        try:
            sim_result = await simulation_engine.run_simulation(
                prompts=job.prompts,
                product_name=project.product_name,
                target_models=job.target_models,
            )

            summary = sim_result["summary"]

            # Check for alert conditions
            mention_rate = summary.get("mention_rate", 0)
            if mention_rate < 20:  # Less than 20% mention rate
                alert = MonitoringAlert(
                    job_id=job_id,
                    project_id=job.project_id,
                    severity=AlertSeverity.warning,
                    alert_type="low_visibility",
                    title=f"Low AI visibility: {mention_rate:.1f}% mention rate",
                    description=f"Your product is mentioned in only {mention_rate:.1f}% of monitored prompts.",
                    current_value=mention_rate,
                )
                db.add(alert)

            # Check for competitors dominating
            competitor_sov = summary.get("competitor_share_of_voice", {})
            for comp, sov in competitor_sov.items():
                if sov > 80:
                    alert = MonitoringAlert(
                        job_id=job_id,
                        project_id=job.project_id,
                        severity=AlertSeverity.critical,
                        alert_type="competitor_dominant",
                        title=f"{comp} dominates AI answers ({sov:.1f}% share of voice)",
                        description=f"{comp} appears in {sov:.1f}% of AI responses for your monitored prompts.",
                        current_value=sov,
                    )
                    db.add(alert)

            job.last_run_at = datetime.utcnow().isoformat()
            job.last_run_status = "completed"
            await db.commit()

        except Exception as exc:
            job.last_run_status = "failed"
            await db.commit()


@celery_app.task(name="app.workers.tasks.run_scheduled_monitoring")
def run_scheduled_monitoring():
    """Scheduled task — run all active monitoring jobs."""
    return run_async(_run_scheduled())


async def _run_scheduled():
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.models.monitoring import MonitoringJob

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(MonitoringJob).where(MonitoringJob.is_active == True)
        )
        active_jobs = result.scalars().all()

    for job in active_jobs:
        run_monitoring_task.delay(job.id)


# ─── Topic graph ──────────────────────────────────────────────────────────────

@celery_app.task(name="app.workers.tasks.generate_topic_graph_task")
def generate_topic_graph_task(
    project_id: str, product_name: str, product_category: str, depth: int
):
    return run_async(_generate_topic_graph(project_id, product_name, product_category, depth))


async def _generate_topic_graph(
    project_id: str, product_name: str, product_category: str, depth: int
):
    import re
    from app.core.database import AsyncSessionLocal
    from app.models.topic import TopicEdge, TopicNode
    from app.services.llm_client import llm_client

    prompt = f"""Generate a comprehensive topic ecosystem graph for {product_name} in the "{product_category}" category.

Create a hierarchical topic graph with:
- 1 root topic (the main category)
- 5-8 core topic clusters
- 20-30 specific topics across all clusters
- For each topic: name, importance (1-10), typical prompts users ask, whether an average company in this space would have content on it

Format as JSON:
{{
  "root": {{
    "name": "{product_category}",
    "slug": "<slug>",
    "topics": [
      {{
        "name": "<cluster name>",
        "slug": "<slug>",
        "importance": <1-10>,
        "subtopics": [
          {{
            "name": "<topic name>",
            "slug": "<slug>",
            "importance": <1-10>,
            "related_prompts": ["<prompt>", "<prompt>"],
            "typically_covered": <true/false>
          }}
        ]
      }}
    ]
  }}
}}"""

    result = await llm_client.extract_json(prompt)

    async with AsyncSessionLocal() as db:
        # Create root node
        root_data = result.get("root", {})
        root_node = TopicNode(
            project_id=project_id,
            name=root_data.get("name", product_category),
            slug=root_data.get("slug", product_category.lower().replace(" ", "-")),
            depth=0,
            node_type="core",
            importance_score=10.0,
        )
        db.add(root_node)
        await db.flush()

        # Create cluster and topic nodes
        for cluster in root_data.get("topics", []):
            cluster_node = TopicNode(
                project_id=project_id,
                name=cluster["name"],
                slug=cluster.get("slug", cluster["name"].lower().replace(" ", "-")),
                parent_id=root_node.id,
                depth=1,
                node_type="core",
                importance_score=float(cluster.get("importance", 7)),
            )
            db.add(cluster_node)
            await db.flush()

            # Edge: root -> cluster
            edge = TopicEdge(
                project_id=project_id,
                source_id=root_node.id,
                target_id=cluster_node.id,
                relationship_type="subtopic_of",
                weight=1.0,
            )
            db.add(edge)

            for subtopic in cluster.get("subtopics", []):
                topic_node = TopicNode(
                    project_id=project_id,
                    name=subtopic["name"],
                    slug=subtopic.get("slug", subtopic["name"].lower().replace(" ", "-")),
                    parent_id=cluster_node.id,
                    depth=2,
                    node_type="gap" if not subtopic.get("typically_covered", True) else "core",
                    importance_score=float(subtopic.get("importance", 5)),
                    related_prompts=subtopic.get("related_prompts", []),
                )
                db.add(topic_node)
                await db.flush()

                edge = TopicEdge(
                    project_id=project_id,
                    source_id=cluster_node.id,
                    target_id=topic_node.id,
                    relationship_type="subtopic_of",
                    weight=0.8,
                )
                db.add(edge)

        await db.commit()


# ─── Competitive analysis ─────────────────────────────────────────────────────

@celery_app.task(name="app.workers.tasks.run_competitive_analysis_task")
def run_competitive_analysis_task(project_id: str, prompts: list[str], target_models: list[str]):
    return run_async(_run_competitive_analysis(project_id, prompts, target_models))


async def _run_competitive_analysis(
    project_id: str, prompts: list[str], target_models: list[str]
):
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.models.competitive import Competitor, CompetitiveReport
    from app.models.project import Project
    from app.services.simulation_engine import simulation_engine

    async with AsyncSessionLocal() as db:
        proj_result = await db.execute(select(Project).where(Project.id == project_id))
        project = proj_result.scalar_one_or_none()
        if not project:
            return

        comp_result = await db.execute(
            select(Competitor).where(Competitor.project_id == project_id)
        )
        competitors = comp_result.scalars().all()

        # Run simulation for each competitor
        for competitor in competitors:
            try:
                sim_result = await simulation_engine.run_simulation(
                    prompts=prompts,
                    product_name=competitor.name,
                    target_models=target_models,
                )
                summary = sim_result["summary"]

                report = CompetitiveReport(
                    competitor_id=competitor.id,
                    project_id=project_id,
                    share_of_voice=summary.get("mention_rate"),
                    mention_frequency=summary.get("mention_rate"),
                    avg_sentiment=summary.get("avg_sentiment"),
                    prompt_results=sim_result["results"][:20],  # Truncate for storage
                )
                db.add(report)

                # Update competitor aggregate metrics
                competitor.llm_share_of_voice = summary.get("mention_rate")
                competitor.mention_frequency = summary.get("mention_rate")
                competitor.avg_sentiment = summary.get("avg_sentiment")

            except Exception:
                continue

        await db.commit()
