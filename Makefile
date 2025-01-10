COMPOSE_FILE ?= compose.dev.yaml

.PHONY: build-development
build-development: ## Build the development docker image.
	docker compose -f ${COMPOSE_FILE} build

.PHONY: start-development
start-development: ## Start the development docker container.
	docker compose -f ${COMPOSE_FILE} up -d

.PHONY: stop-development
stop-development: ## Stop the development docker container.
	docker compose -f ${COMPOSE_FILE} down

.PHONY: clear-cache
clear-cache:
	docker builder prune --all --force