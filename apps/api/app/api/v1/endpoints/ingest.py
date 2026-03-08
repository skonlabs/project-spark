"""Content ingestion endpoints."""
from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, HttpUrl
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.content import ContentAsset, ContentSourceType, ContentStatus
from app.models.project import Project
from app.models.user import User

router = APIRouter(prefix="/ingest", tags=["Content Ingestion"])

ALLOWED_EXTENSIONS = {
    ".pdf", ".docx", ".doc", ".txt", ".md", ".markdown",
    ".html", ".htm", ".csv", ".json",
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


class URLIngestRequest(BaseModel):
    project_id: str
    url: str
    collection_id: str | None = None


class SitemapIngestRequest(BaseModel):
    project_id: str
    sitemap_url: str
    collection_id: str | None = None


class CrawlRequest(BaseModel):
    project_id: str
    base_url: str
    max_pages: int = 50
    collection_id: str | None = None


class GitHubIngestRequest(BaseModel):
    project_id: str
    repo_url: str
    github_token: str | None = None
    file_extensions: list[str] = [".md", ".txt", ".rst"]
    collection_id: str | None = None


class ContentAssetResponse(BaseModel):
    id: str
    project_id: str
    title: str | None
    source_url: str | None
    source_type: str
    file_type: str | None
    status: str
    word_count: int | None
    tags: list
    created_at: str

    model_config = {"from_attributes": True}

    def model_post_init(self, __context):
        if hasattr(self, "created_at") and self.created_at:
            self.created_at = str(self.created_at)


@router.post("/upload", response_model=ContentAssetResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    project_id: str = Form(...),
    file: UploadFile = File(...),
    collection_id: str | None = Form(default=None),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a file for ingestion (PDF, DOCX, TXT, MD, HTML, CSV, JSON)."""
    from pathlib import Path

    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // 1024 // 1024} MB",
        )

    # Create asset record
    asset = ContentAsset(
        project_id=project_id,
        collection_id=collection_id,
        title=file.filename,
        source_type=ContentSourceType.file_upload,
        file_type=ext.lstrip("."),
        status=ContentStatus.pending,
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)

    # Process in background
    background_tasks.add_task(
        _process_file_upload,
        asset_id=asset.id,
        file_content=content,
        filename=file.filename or "upload",
        content_type=file.content_type or "application/octet-stream",
    )

    return asset


@router.post("/url", response_model=ContentAssetResponse, status_code=status.HTTP_201_CREATED)
async def ingest_url(
    payload: URLIngestRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ingest content from a single URL."""
    asset = ContentAsset(
        project_id=payload.project_id,
        collection_id=payload.collection_id,
        source_url=payload.url,
        source_type=ContentSourceType.url,
        status=ContentStatus.pending,
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)

    background_tasks.add_task(_process_url_ingest, asset_id=asset.id, url=payload.url)

    return asset


@router.post("/sitemap", status_code=status.HTTP_202_ACCEPTED)
async def ingest_sitemap(
    payload: SitemapIngestRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ingest all URLs from a sitemap.xml."""
    background_tasks.add_task(
        _process_sitemap,
        project_id=payload.project_id,
        sitemap_url=payload.sitemap_url,
        collection_id=payload.collection_id,
    )
    return {"message": "Sitemap ingestion started", "sitemap_url": payload.sitemap_url}


@router.post("/crawl", status_code=status.HTTP_202_ACCEPTED)
async def crawl_website(
    payload: CrawlRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Crawl an entire website and ingest all discovered pages."""
    background_tasks.add_task(
        _process_crawl,
        project_id=payload.project_id,
        base_url=payload.base_url,
        max_pages=payload.max_pages,
        collection_id=payload.collection_id,
    )
    return {
        "message": f"Web crawl started — will crawl up to {payload.max_pages} pages",
        "base_url": payload.base_url,
    }


@router.post("/github", status_code=status.HTTP_202_ACCEPTED)
async def ingest_github(
    payload: GitHubIngestRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ingest documentation from a GitHub repository."""
    background_tasks.add_task(
        _process_github_ingest,
        project_id=payload.project_id,
        repo_url=payload.repo_url,
        github_token=payload.github_token,
        file_extensions=payload.file_extensions,
        collection_id=payload.collection_id,
    )
    return {"message": "GitHub ingestion started", "repo_url": payload.repo_url}


@router.get("/{project_id}/assets", response_model=list[ContentAssetResponse])
async def list_assets(
    project_id: str,
    status_filter: str | None = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List content assets for a project."""
    query = select(ContentAsset).where(ContentAsset.project_id == project_id)
    if status_filter:
        query = query.where(ContentAsset.status == status_filter)
    query = query.order_by(ContentAsset.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()


# ─── Background task helpers ──────────────────────────────────────────────────

def _process_file_upload(asset_id: str, file_content: bytes, filename: str, content_type: str):
    try:
        from app.workers.tasks import process_file_upload_task
        process_file_upload_task.delay(asset_id, file_content, filename, content_type)
    except Exception:
        pass


def _process_url_ingest(asset_id: str, url: str):
    try:
        from app.workers.tasks import process_url_ingest_task
        process_url_ingest_task.delay(asset_id, url)
    except Exception:
        pass


def _process_sitemap(project_id: str, sitemap_url: str, collection_id: str | None):
    try:
        from app.workers.tasks import process_sitemap_task
        process_sitemap_task.delay(project_id, sitemap_url, collection_id)
    except Exception:
        pass


def _process_crawl(project_id: str, base_url: str, max_pages: int, collection_id: str | None):
    try:
        from app.workers.tasks import process_crawl_task
        process_crawl_task.delay(project_id, base_url, max_pages, collection_id)
    except Exception:
        pass


def _process_github_ingest(
    project_id: str,
    repo_url: str,
    github_token: str | None,
    file_extensions: list[str],
    collection_id: str | None,
):
    try:
        from app.workers.tasks import process_github_ingest_task
        process_github_ingest_task.delay(
            project_id, repo_url, github_token, file_extensions, collection_id
        )
    except Exception:
        pass
