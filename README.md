# Next.js Dashboard Project

A modern dashboard application built with Next.js, React, PostgreSQL, and Drizzle ORM. The project is fully containerized for local development and testing with Docker Compose, **except for the Next.js app, which runs outside Docker**.
**Reason:** Passing secrets from HashiCorp Vault into Docker containers was more trouble than it was worth; running Next.js outside Docker allows direct, secure access to secrets via environment variables.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Docker Development Setup](#docker-development-setup)
- [Available Commands](#available-commands)
- [Accessing Services](#accessing-services)
- [Testing](#testing)
- [Debugging](#debugging)
- [Recent Improvements](#recent-improvements)
- [Next Steps](#next-steps)

---

## Features

- **Next.js 15+ (App Router)**
- **TypeScript 5+** with strict typing
- **React 19+** and React DOM 19+
- **Tailwind CSS 4+** for styling
- **PostgreSQL 17+** with Drizzle ORM 0.4+
- **Docker Compose** for local development (except Next.js app)
- **Cypress** for E2E and component testing
- **Adminer** for database UI
- **Secure secrets management** via HashiCorp Vault

---

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Node.js, Next.js API routes, Drizzle ORM
- **Database:** PostgreSQL
- **Testing:** Cypress (E2E & component), Vitest (planned)
- **Containerization:** Docker, Docker Compose (except Next.js app)
- **CI/CD:** GitHub Actions (lint, type-check, test, build, deploy)
- **Linting/Formatting:** ESLint, Prettier

---

## Getting Started

### Prerequisites

- Docker & Docker Compose CLI
- Node.js (v24+) and pnpm installed locally
- [HashiCorp Vault](https://www.vaultproject.io/) CLI for secrets management

### Initial Setup

1. **Configure secrets using HashiCorp Vault:**

   Store your secrets in Vault and export them as environment variables before starting the Next.js app.
   _Example:_

   ```bash
   export SESSION_SECRET=$(vault kv get -field=session_secret secret/nextjs-dashboard)
   export POSTGRES_PASSWORD=$(vault kv get -field=postgres_password secret/nextjs-dashboard)
   export POSTGRES_URL=$(vault kv get -field=postgres_url secret/nextjs-dashboard)
   ```

   Alternatively, use [HCP Vault Secrets](https://developer.hashicorp.com/vault/tutorials/cloud/cloud-secrets) to inject secrets for CLI commands:

   ```bash
   hcp vault-secrets run -- pnpm next dev
   ```

2. **Start Docker services (database, Adminer, Cypress, etc):**

   ```bash
   pnpm docker:dev
   ```

   This builds and starts all containers except the Next.js app.

3. **Start the Next.js app locally (outside Docker):**

   ```bash
   hcp vault-secrets run -- pnpm next dev
   ```

   The app will use secrets from your environment.

4. **Initialize the database (first time only):**

   ```bash
   pnpm docker:up
   docker compose -f compose.dev.yaml exec web pnpm schema-update-initial
   docker compose -f compose.dev.yaml exec web pnpm drizzle-seed
   ```

---

## Docker Development Setup

- **All services** (db, testDB, adminer, cypress) are orchestrated via Docker Compose.
- **Next.js app runs outside Docker** to simplify secrets management with HashiCorp Vault.
- **Secrets** are never committed—use Vault or environment variables.
- **Database schema and seed scripts** are run automatically on container creation.

---

## CLI Usage with Vault

Some CLI commands require secrets from Vault. Use `hcp vault-secrets run --` to ensure secrets are available in the environment.

**Examples:**

- Next.js (dev/build/start):
  ```bash
  hcp vault-secrets run -- pnpm next dev --turbopack
  hcp vault-secrets run -- pnpm next build --turbopack
  hcp vault-secrets run -- pnpm next start
  ```
- Drizzle Kit:
  ```bash
  hcp vault-secrets run -- pnpm drizzle-kit up --config=drizzle-test.config.ts
  hcp vault-secrets run -- pnpm drizzle-kit generate --config=drizzle-test.config.ts
  ```

See [docs/cli.md](docs/cli.md) for more details.

---

## Available Commands

| Command                             | Description                                   |
| ----------------------------------- | --------------------------------------------- |
| `pnpm docker:build`                 | Build Docker containers                       |
| `pnpm docker:up`                    | Start containers in detached mode             |
| `pnpm docker:down`                  | Stop containers                               |
| `pnpm docker:logs`                  | Show container logs                           |
| `pnpm docker:test`                  | Run Docker setup tests                        |
| `pnpm docker:clean`                 | Stop containers and remove volumes            |
| `pnpm docker:restart`               | Restart containers                            |
| `pnpm docker:dev`                   | Start containers and show logs (main command) |
| `pnpm drizzle-schema-update`        | Push schema changes to dev database           |
| `pnpm drizzle-seed`                 | Seed dev database                             |
| `pnpm drizzle-schema-update-testDB` | Push schema to test database                  |
| `pnpm drizzle-seed-testDB`          | Seed test database                            |
| `pnpm cyp:test:e2e`                 | Run Cypress E2E tests in Docker               |

---

## Accessing Services

- **Next.js App:** [http://localhost:3000](http://localhost:3000) (runs locally, not in Docker)
- **Adminer (DB UI):** [http://localhost:8080](http://localhost:8080)
- **PostgreSQL:** `localhost:5432`

---

## Startup Reference

See [docs/startup.md](docs/startup.md) for detailed startup instructions for each service, including Docker commands for PostgreSQL and Adminer, and production Next.js startup.

---

## Testing

- **E2E & Component:** Cypress (run in Docker)
- **Unit Testing:** Vitest (planned)
- **Test DB:** Isolated PostgreSQL instance for tests
- **Coverage:** High coverage required; external dependencies and DB are mocked in tests

---

## Debugging

- The Next.js app can be debugged locally using Node.js inspector.
- Use the `debug` script or connect your IDE (VS Code/WebStorm) to port `9229`.

---

## Recent Improvements

- Consistent base image versions for Docker
- Optimized Docker layers and image size
- Non-root user and secure file permissions
- Improved logging and error handling
- Robust dependency installation
- [See details in DOCKER-IMPROVEMENTS.md](./DOCKER-IMPROVEMENTS.md)

---

## Next Steps

- Automate DB schema and seed initialization on container creation
- Add Vitest for unit testing
- Create a production Dockerfile with multi-stage builds

---

## Security & Best Practices

- **Secrets:** Use HashiCorp Vault or env vars; never commit secrets
- **Input Validation:** All user input is sanitized and validated
- **OWASP:** Follows OWASP web security best practices
- **Linting/Formatting:** Enforced via ESLint and Prettier in CI

---
