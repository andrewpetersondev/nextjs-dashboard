---
applyTo: '**'
description: 'Project structure, organization, and architectural strategies for Next.js + TypeScript monorepo.'
---

# Structure & Architecture

## Purpose

Document the organization, layering, and architectural strategies for maintainability, scalability, and clarity.

---

## Directory Structure

- `src/app/`: Next.js App Router entry, layouts, pages, API routes.
- `src/features/`: Feature modules (auth, customers, invoices, revenues, users) with domain logic, components, types,
  and libs.
- `src/server/`: Server-side code (auth, config, db, errors, events, forms, logging, repository, etc.).
- `src/shared/`: Shared utilities, domain types, config, forms, i18n, logging, money, routes, UI primitives.
- `src/shell/`: Shell components for dashboard and UI composition.
- `src/ui/`: UI primitives, atoms, molecules, navigation, styles, and organization docs.

---

## Layered Architecture

- **App Layer**: Routing, layout, and top-level error handling (`src/app/`).
- **Feature Layer**: Domain-specific logic, components, and types (`src/features/`).
- **Server Layer**: Data access, business logic, error handling, and events (`src/server/`).
- **Shared Layer**: Cross-cutting concerns, utilities, and domain models (`src/shared/`).
- **UI Layer**: Reusable UI primitives and composition patterns (`src/ui/`).

---

## Strategies

- Organize by feature/domain for scalability.
- Separate server/client concerns; prefer server components for data and logic.
- Use strict TypeScript settings and explicit types everywhere.
- Treat inputs as immutable; avoid in-place mutations.
- Use discriminated unions for error/result handling.
- Prefer small, focused modules; avoid dumping grounds and barrel files.
- Validate and parse inputs server-side (Zod recommended).
- Use biome for formatting and linting.

---

## Tooling

- Next.js (App Router)
- TypeScript (strict mode)
- Biome (formatting/linting)
- Cypress (e2e testing)
- Drizzle (database migrations/config)
- pnpm (package management)
- PostCSS (CSS processing)

---

## Review Checklist

- Directory and module organization by feature/domain.
- Layer separation: app, feature, server, shared, UI.
- Strict TypeScript and explicit types.
- Immutability and error handling strategies.
- Tooling and configuration validated.
