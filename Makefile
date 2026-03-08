# ─────────────────────────────────────────────────────────────────
# GAEO Platform — Makefile
# ─────────────────────────────────────────────────────────────────

.PHONY: help up down dev migrate seed clean logs test api-shell

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Docker ───────────────────────────────────────────────────────

up: ## Start all services
	docker-compose up -d
	@echo "✓ Platform running at http://localhost:3000"
	@echo "✓ API docs at http://localhost:8000/docs"
	@echo "✓ Celery Flower at http://localhost:5555"
	@echo "✓ MinIO console at http://localhost:9001"

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

rebuild: ## Rebuild and restart all services
	docker-compose up --build -d

logs: ## Follow logs for all services
	docker-compose logs -f

logs-api: ## Follow API logs
	docker-compose logs -f api

logs-worker: ## Follow Celery worker logs
	docker-compose logs -f celery_worker

# ─── Database ─────────────────────────────────────────────────────

migrate: ## Run database migrations
	docker-compose exec api alembic upgrade head

migrate-down: ## Rollback last migration
	docker-compose exec api alembic downgrade -1

migration: ## Create a new migration (usage: make migration name="description")
	docker-compose exec api alembic revision --autogenerate -m "$(name)"

seed: ## Seed database with demo data
	docker-compose exec api python -m app.core.seed

# ─── Development ──────────────────────────────────────────────────

dev-api: ## Run API in development mode (without Docker)
	cd apps/api && uvicorn app.main:app --reload --port 8000

dev-web: ## Run web app in development mode (without Docker)
	cd apps/web && npm run dev

dev-worker: ## Run Celery worker in development mode
	cd apps/api && celery -A app.workers.celery_app worker --loglevel=info

# ─── Testing ──────────────────────────────────────────────────────

test: ## Run all tests
	docker-compose exec api pytest

test-api: ## Run API tests only
	docker-compose exec api pytest apps/api/tests/

# ─── Utilities ────────────────────────────────────────────────────

api-shell: ## Open Python shell in API container
	docker-compose exec api python

clean: ## Remove all containers and volumes (WARNING: destroys data)
	docker-compose down -v
	docker system prune -f

install-web: ## Install web dependencies
	cd apps/web && npm install

format: ## Format code
	cd apps/api && black . && isort .
	cd apps/web && npx prettier --write "src/**/*.{ts,tsx}"
