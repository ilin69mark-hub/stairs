.PHONY: up up-dev up-prod up-strapi down down-all ps logs logs-be logs-st logs-db dev-all

up: ## Start all dev services (postgres, redis, minio)
	docker compose up -d

up-dev: up
	@echo "Services running: postgres:5432, redis:6379, minio:9000/9001"

up-all: ## Start all services (postgres, redis, minio, strapi)
	docker compose -f docker-compose.yml -f docker-compose.strapi.yml up -d

up-prod: ## Start production stack
	docker compose -f docker-compose.prod.yml up -d

up-strapi: ## Start strapi dev server
	docker compose -f docker-compose.strapi.yml up -d

down: ## Stop services from docker-compose.yml
	docker compose down

down-all: ## Stop all services
	docker compose -f docker-compose.yml -f docker-compose.strapi.yml down
	docker compose -f docker-compose.prod.yml down

ps: ## Show running containers
	docker compose ps

logs: ## Show logs (all services)
	docker compose logs -f

logs-be: ## Backend logs
	docker compose -f docker-compose.prod.yml logs -f backend

logs-st: ## Strapi logs
	docker compose -f docker-compose.strapi.yml logs -f strapi

logs-db: ## Postgres logs
	docker compose logs -f postgres

restart: down up ## Restart dev services

clean: ## Remove all containers and volumes
	docker compose down -v
	docker compose -f docker-compose.strapi.yml down -v

dev-all: up-all ## Start all services for local dev (docker + backend + frontend)
	@echo "Starting backend, geometry watcher, and frontend..."; \
	trap 'kill 0' EXIT; \
	(cd backend && go run ./cmd/server) & \
	(cd packages/stair-geometry && npm run build && npm run dev) & \
	(cd frontend && npm run dev) & \
	wait

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'