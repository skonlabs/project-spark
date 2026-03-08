"""
Platform configuration — loaded from environment variables.
"""
from __future__ import annotations

from typing import Literal
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ─── Application ─────────────────────────────────────────────────────────
    app_name: str = "GAEO Platform"
    app_env: Literal["development", "staging", "production"] = "development"
    app_secret_key: str = Field(min_length=32)
    app_url: str = "http://localhost:3000"
    api_url: str = "http://localhost:8000"
    debug: bool = False
    version: str = "1.0.0"

    # ─── Database ─────────────────────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://gaeo:gaeo_pass@localhost:5432/gaeo_db"
    database_sync_url: str = "postgresql://gaeo:gaeo_pass@localhost:5432/gaeo_db"
    database_pool_size: int = 20
    database_max_overflow: int = 40

    # ─── Redis ────────────────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # ─── AI / LLM ─────────────────────────────────────────────────────────────
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    google_ai_api_key: str = ""
    xai_api_key: str = ""
    primary_llm: str = "claude-sonnet-4-6"

    # ─── Auth ─────────────────────────────────────────────────────────────────
    jwt_secret_key: str = Field(default="change-this-secret-key-in-production")
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 30

    google_client_id: str = ""
    google_client_secret: str = ""
    microsoft_client_id: str = ""
    microsoft_client_secret: str = ""
    okta_domain: str = ""
    okta_client_id: str = ""
    okta_client_secret: str = ""

    # ─── Storage ─────────────────────────────────────────────────────────────
    s3_endpoint_url: str = "http://localhost:9000"
    s3_access_key_id: str = "minioadmin"
    s3_secret_access_key: str = "minioadmin"
    s3_bucket_name: str = "gaeo-content"
    s3_region: str = "us-east-1"

    # ─── Web Crawling ─────────────────────────────────────────────────────────
    crawl_max_pages: int = 500
    crawl_timeout_seconds: int = 30
    crawl_user_agent: str = "GAEOBot/1.0"

    # ─── Rate Limiting ────────────────────────────────────────────────────────
    rate_limit_per_minute: int = 60
    rate_limit_per_hour: int = 1000

    # ─── Email ────────────────────────────────────────────────────────────────
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_from: str = "noreply@gaeo.ai"

    # ─── Derived properties ───────────────────────────────────────────────────
    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def cors_origins(self) -> list[str]:
        origins = [self.app_url, self.api_url]
        if not self.is_production:
            origins.extend(["http://localhost:3000", "http://localhost:8000"])
        return origins


settings = Settings()
