---
apply: always
---

# Structure & Architecture Rules

## Purpose

Document and enforce the organization, layering, and architectural strategies for maintainability, scalability, and
clarity throughout the project.

---

## Directory Structure

- **src/app/**: Next.js App Router entry, layouts, pages, API routes.
- **src/features/**: Feature modules (auth, customers, invoices, revenues, users) containing domain logic, components,
  types, and libraries.
- **src/server/**: Server-side code (auth, configuration, db, errors, events, forms, logging, repositories, etc.).
- **src/shared/**: Shared utilities, domain types, config, forms, i18n, logging, money, routes, UI primitives.
- **src/shell/**: Shell components for dashboard and UI composition.
- **src/ui/**: UI primitives, atoms, molecules, navigation, styles, and documentation for organization.

---

## Layered Architecture

- **App Layer**: Routing, layout, top-level error handling (`src/app/`).
- **Feature Layer**: Domain-specific logic, components, types (`src/features/`).
- **Server Layer**: Data access, business logic, error handling, events (`src/server/`).
- **Shared Layer**: Cross-cutting concerns, utilities, and domain models (`src/shared/`).
- **UI Layer**: Reusable UI primitives and composition patterns (`src/ui/`).

---

## Strategies & Principles

- Organize modules strictly by feature/domain to maximize scalability.
- Enforce strict separation of server/client code: prefer server components for data logic.
- Use strict TypeScript with explicit types in all layers.
- Treat all mutable input as immutable; avoid any in-place mutation.
- Use discriminated unions for all error/result handling.
- Prefer small, focused modules; avoid dumping grounds and barrel files.
- Validate and parse inputs server-side (Zod recommended).
- Use biome for formatting and linting.

---

## Approved Tooling

- Next.js (App Router)
- TypeScript (strict mode)
- Biome (formatting and linting)
- Cypress (end-to-end testing)
- Drizzle (database migrations/config)
- pnpm (package management)
- PostCSS (CSS processing)

---

## Review Checklist

- Directory/module organization follows feature/domain boundaries.
- Layer boundaries (app, feature, server, dal, repository, service, action, shared, UI) are maintained.
- Explicit strict TypeScript usage in all files.
- Immutability and error handling patterns are applied consistently.
- Tooling and configuration are validated and up-to-date.

---

_Last updated: YYYY-MM-DD_
