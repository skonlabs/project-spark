# ─────────────────────────────────────────────────────────────────
# GAEO Platform — Makefile
# ─────────────────────────────────────────────────────────────────

.PHONY: help up down dev migrate seed clean logs

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Docker ───────────────────────────────────────────────────────

up: ## Start all services
	docker-compose up -d
	@echo "✓ Platform running at http://localhost:3000"
	@echo "✓ MinIO console at http://localhost:9001"

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

rebuild: ## Rebuild and restart all services
	docker-compose up --build -d

logs: ## Follow logs for all services
	docker-compose logs -f

logs-web: ## Follow web logs
	docker-compose logs -f web

# ─── Database ─────────────────────────────────────────────────────

migrate: ## Run Prisma migrations
	cd apps/web && npx prisma migrate deploy

db-push: ## Push Prisma schema to database (dev)
	cd apps/web && npx prisma db push

db-studio: ## Open Prisma Studio
	cd apps/web && npx prisma studio

db-generate: ## Generate Prisma client
	cd apps/web && npx prisma generate

seed: ## Seed database with demo data
	cd apps/web && npm run db:seed

# ─── Development ──────────────────────────────────────────────────

dev: ## Run web app in development mode
	cd apps/web && npm run dev

install: ## Install web dependencies
	cd apps/web && npm install

# ─── Utilities ────────────────────────────────────────────────────

clean: ## Remove all containers and volumes (WARNING: destroys data)
	docker-compose down -v
	docker system prune -f

format: ## Format code
	cd apps/web && npx prettier --write "src/**/*.{ts,tsx}"
