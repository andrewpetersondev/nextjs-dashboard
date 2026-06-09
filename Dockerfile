# syntax=docker/dockerfile:1
#
# Multi-stage build that produces a small, self-contained image for the
# Next.js app using `output: "standalone"` (set in next.config.ts).
#
# Why standalone: Next traces exactly the files the server needs and emits a
# minimal `server.js`, so the runtime image carries no pnpm, no dev deps, and
# only the production node_modules it actually uses.
#
# This image is host-agnostic: it talks to any Postgres over DATABASE_URL.
# See docker-compose.yml for a one-command local stack (app + Postgres).

##############################
# base: Node + pnpm (corepack)
##############################
FROM node:26-alpine AS base
# `libc6-compat` covers the glibc shims some Node binaries expect on Alpine.
RUN apk add --no-cache libc6-compat
# Node 25+ no longer bundles corepack, so install it, then let it provide the
# exact pnpm pinned in package.json "packageManager". Never prompt to download.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN npm install -g corepack@latest && corepack enable
WORKDIR /app

##############################
# deps: install node_modules
##############################
FROM base AS deps
# Skip Cypress's large binary download — it's an e2e tool, never needed to
# build or run the production server.
ENV CYPRESS_INSTALL_BINARY=0
# pnpm-workspace.yaml carries overrides + onlyBuiltDependencies, so it must be
# present or --frozen-lockfile rejects the install as out of sync.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

##############################
# builder: compile the app
##############################
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time env. The env layer (src/shared/core/config) validates these when
# server modules are imported during `next build`, so they must be present and
# well-formed. The secret-shaped ones are PLACEHOLDERS — real values are
# injected at runtime by docker-compose / your host. NEXT_PUBLIC_* values are
# inlined into the client bundle at build time, so set their real values here.
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_ENV=production
ENV LOG_LEVEL=info
ENV NEXT_PUBLIC_NODE_ENV=production
ENV NEXT_PUBLIC_LOG_LEVEL=info
ENV SESSION_ISSUER=my-app
ENV SESSION_AUDIENCE=web
ENV AUTH_BCRYPT_SALT_ROUNDS=12
ENV SESSION_SECRET=build-time-placeholder-overridden-at-runtime
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN pnpm next:build

##############################
# runner: minimal runtime image
##############################
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Bind to all interfaces so the container is reachable from the host/network.
ENV HOSTNAME=0.0.0.0

# Run as an unprivileged user.
RUN addgroup --system --gid 1001 nodejs \
	&& adduser --system --uid 1001 nextjs

# Standalone output, plus the static assets it expects to find beside it.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

# Entry point emitted by Next's standalone output.
CMD ["node", "server.js"]
