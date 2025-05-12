# Next.js Dashboard Project

This project is a dashboard application built with Next.js, React, PostgreSQL, and Drizzle ORM, containerized with Docker for development.

## Get Started

1. Open root container and run `npx drizzle-kit push`
2. comment out "import server-only" in src/db/database.ts, then run "pnpm dlx tsx src/db/seeds/bestSeed.ts" in root container
3. replace "import server-only" in database.ts
4.

## Main Technologies

1. **Next.js & React**

   - Server and client components
   - Middleware for authentication and authorization
   - Edge and Node.js runtimes

2. **Database**

   - PostgreSQL
   - Drizzle ORM for database operations and migrations

3. **Styling**

   - TailwindCSS v4

4. **Testing**

   - Cypress for component and E2E testing
   - Vitest (planned)
   - Test Containers

5. **Development Environment**
   - Docker and Docker Compose CLI
   - TypeScript
   - Debugging configuration

## Docker Development Setup

The project includes a fully configured Docker development environment that addresses common issues with Node.js, Next.js, and pnpm in containers.

### Prerequisites

- Docker installed with Docker Compose CLI
- Node.js and pnpm installed locally (for running scripts)

### Getting Started

1. **Create required secrets files**

   ```bash
   mkdir -p secrets
   echo "your-session-secret" > secrets/session_secret.txt
   echo "your-postgres-password" > secrets/postgres_password.txt
   echo "postgres://postgres:your-postgres-password@db:5432/postgres" > secrets/postgres_url.txt
   ```

2. **Start the development environment**

   ```bash
   pnpm docker:dev
   ```

   This will build and start all containers, and show the logs.

3. **Initialize the database (first time only)**

   Once the containers are running:

   ```bash
   pnpm docker:up
   docker compose -f compose.dev.yaml exec web pnpm schema-update-initial
   docker compose -f compose.dev.yaml exec web pnpm drizzle-seed
   ```

### Available Docker Commands

The following npm/pnpm scripts are available for working with Docker:

- `pnpm docker:build` - Build the Docker containers
- `pnpm docker:up` - Start the Docker containers in detached mode
- `pnpm docker:down` - Stop the Docker containers
- `pnpm docker:logs` - Show the logs from the Docker containers
- `pnpm docker:test` - Run tests to verify the Docker setup
- `pnpm docker:clean` - Stop the Docker containers and remove volumes
- `pnpm docker:restart` - Restart the Docker containers
- `pnpm docker:dev` - Start the Docker containers and show the logs (main development command)

### Accessing Services

- **Next.js Application**: http://localhost:3000
- **Adminer (Database UI)**: http://localhost:8080
- **PostgreSQL**: localhost:5432

### Debugging

The Next.js application in the container is configured with the Node.js inspector enabled. You can:

1. Use the `debug` npm script inside the container
2. Connect to the debugger using your IDE (e.g., VS Code or WebStorm) on port 9229

## Recent Improvements

The Docker setup has been refactored according to best practices:

- Using specific versions of base images for consistency
- Optimized for layer caching and smaller image sizes
- Improved security with non-root user and proper file permissions
- Simplified configuration with proper startup order
- Better developer experience with improved logging and error handling
- Fixed dependency installation issues with a more robust approach

For detailed information about the improvements, see [DOCKER-IMPROVEMENTS.md](./DOCKER-IMPROVEMENTS.md).

## Next Steps

- Implement automatic database schema and seed initialization on container creation
- Set up Vitest for unit testing
- Create a production Dockerfile with multi-stage builds
