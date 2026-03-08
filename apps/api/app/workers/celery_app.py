"""Celery application configuration."""
from __future__ import annotations

from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery(
    "gaeo",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["app.workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_routes={
        "app.workers.tasks.run_analysis_task": {"queue": "analysis"},
        "app.workers.tasks.run_simulation_task": {"queue": "simulation"},
        "app.workers.tasks.process_file_upload_task": {"queue": "ingestion"},
        "app.workers.tasks.process_url_ingest_task": {"queue": "ingestion"},
        "app.workers.tasks.process_sitemap_task": {"queue": "ingestion"},
        "app.workers.tasks.process_crawl_task": {"queue": "ingestion"},
        "app.workers.tasks.process_github_ingest_task": {"queue": "ingestion"},
        "app.workers.tasks.run_monitoring_task": {"queue": "monitoring"},
        "app.workers.tasks.run_competitive_analysis_task": {"queue": "analysis"},
        "app.workers.tasks.generate_topic_graph_task": {"queue": "analysis"},
    },
    # Scheduled tasks (beat)
    beat_schedule={
        "run-active-monitoring-jobs": {
            "task": "app.workers.tasks.run_scheduled_monitoring",
            "schedule": crontab(minute="*/30"),  # Every 30 minutes
        },
    },
)
