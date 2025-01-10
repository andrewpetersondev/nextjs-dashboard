.PHONY: build-development
build-development: ## Build the development docker image.
	docker compose -f --env-file .env compose.dev.yaml --profile dev build

.PHONY: build-development-new
build-development-new: ## Build the development docker image.
	CACHEBUST=$$(date +%s) docker compose --env-file .env -f compose.dev.yaml --profile dev build --build-arg CACHEBUST=$$CACHEBUST

.PHONY: build-development-no-cache
build-development-no-cache: ## Build the development docker image without using cache.
	docker compose --env-file .env -f compose.dev.yaml --profile dev build --no-cache

.PHONY: start-development
start-development: ## Start the development docker container.
	docker compose --env-file .env -f compose.dev.yaml --profile dev up -d

.PHONY: stop-development
stop-development: ## Stop the development docker container.
	docker compose --env-file .env -f compose.dev.yaml --profile dev down

.PHONY: clear-cache
clear-cache:
	docker builder prune --all --force