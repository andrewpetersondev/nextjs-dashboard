# Project Structure

Use this guide to decide where code belongs and how layers interact.

> **The model in one line:** each feature is a self-contained vertical slice under
> `src/modules/<feature>/`, internally organized into clean-architecture layers
> (`presentation/`, `application/`, `domain/`, `infrastructure/`) — so a module owns
> its own UI, domain rules, use cases, **and** its data access (repositories, DB
> queries) and server actions. `src/server` is _not_ where feature repositories or
> actions live; it holds only the small set of **shared, cross-cutting** server-only
> pieces (the Drizzle connection, cookies, crypto). For the per-module layering and
> dependency direction, see [diagrams/module-layers.md](diagrams/module-layers.md)
> and [standards/clean-architecture-standards.md](standards/clean-architecture-standards.md).

## 1) Identify the concern: domain capability vs. page/layout composition

- Domain capability: A cohesive business area with its own models, rules, and reusable UI (e.g., auth, invoices,
  customers).
- Page/layout composition: App "chrome" and orchestration that stitches together multiple modules for a route (e.g.,
  dashboard pages, sidebars, nav, guards, providers).

## 2) Map concerns to layers

- UI (React Components)
  - Page Components
    - Layout components (headers, footers, navigation)
    - Dashboard views
    - Form pages
    - Authentication screens
  - Shared Components
    - Buttons and CTAs
    - Input fields and form controls
    - Cards and containers
    - Modal dialogs
    - Tables and data grids
  - UI Elements
    - Typography components
    - Icons and visual elements
    - Loading states and spinners
    - Toast notifications
    - Error boundaries
  - Layout Components
    - Flex containers
    - Grid systems
    - Responsive wrappers
    - Section dividers

- Domain (business logic, data models, services, and core functionality)
  - Models: User, Account, Transaction
  - Services: Authentication, Authorization, Business rules
  - Data validation and transformation logic

- Infrastructure (system setup and technical foundation)
  - Database access, repositories, and migrations
  - Server actions and services
  - Authentication middleware and session handling
  - Integration with external systems

## 3) Apply import-boundary restrictions

- shared: May only import from shared. Lowest-level utilities, tokens, and primitives.
- ui: Base, reusable UI primitives and patterns (atoms/molecules). May import from shared.
- modules: A domain slice, internally layered (presentation/application/domain/infrastructure). May import from modules (itself/peers) and shared/ui. Must not import from shell.
- shell: App composition/orchestration. May import from modules, shared, ui. Should not be imported by modules.
- server: **Shared, cross-cutting** server-only infrastructure (the DB connection, cookies, crypto) — not feature repositories or actions, which live inside each module. Keep server code server-only.
- app (Next.js): Routes and server components. Should delegate domain logic to modules (and shared server infra) and composition to shell.

One-way dependency rule of thumb:
shared/ui -> modules -> shell -> app
the shared `server` infra is usable from modules/shell/app as needed.

---

## Purpose of the `src` folder's children

1. `modules` — Domain-centric vertical slices (auth, invoices, customers, users, banner). Each slice is internally layered (`presentation/`, `application/`, `domain/`, `infrastructure/`) and owns:
   - Domain entities, value objects, and policies (`domain/`)
   - Use cases, contracts, schemas, and mappers (`application/`)
   - Its own data access — repositories, DAL, row↔entity mappers (`infrastructure/`)
   - Server actions and module-scoped UI (`presentation/`)

   Not every module needs every layer — thin CRUD slices (`customers`, `banner`) skip `application/`. See [diagrams/module-layers.md](diagrams/module-layers.md) for the per-module map.

2. `shared` — Cross-cutting, module-agnostic utilities and tokens:
   - Pure helpers, constants, types
   - Design tokens, formatting utilities
   - Must not depend on modules or shell

3. `shell` — Application composition layer (the "app chrome" and orchestration).
   - What it owns:
     - Route and section layouts (e.g., dashboard layout, root frame)
     - Navigation (sidebars, top bars, breadcrumbs) with active state
     - Cross-module wrappers and gates (auth/role guards)
     - App-wide providers (theme, toasts), error and suspense boundaries
     - Page-level compositions that stitch multiple modules together (e.g., a dashboard page showing cards, charts,
       and lists from several modules)
   - What it avoids:
     - Domain/business logic (keep in modules/server)
     - Data access or external API calls (keep in server)
     - Generic utilities (keep in shared)

4. `server` — Shared, cross-cutting server-only infrastructure (the small stuff many modules need):
   - The Drizzle database **connection** (`server/db/`)
   - Cookie handling (`server/cookies/`) and crypto/hashing (`server/crypto/`)
   - Note: feature **repositories** and **server actions** do _not_ live here — they live in each module's `infrastructure/` and `presentation/`. Drizzle schema and migrations live in `database/schema` and `drizzle/migrations/` (see [drizzle.md](drizzle.md)).

5. `ui` — Base UI primitives intended for reuse and extension:
   - Atoms/molecules (buttons, inputs, wrappers)
   - No domain knowledge; may import tokens/utilities from shared

---

## Placement decision tree

1. Is it app chrome or cross-module composition (layouts, nav, role gates, dashboard composition)?
   - Yes → Place in `shell`.
2. Is it a domain capability — a repository, use case, server action, domain rule, or module UI for one feature?
   - Yes → Place in the right layer of `modules/<module>` (`infrastructure/`, `application/`, `presentation/`, `domain/`).
3. Is it shared, cross-cutting server-only infrastructure used by many modules (the DB connection, cookies, crypto)?
   - Yes → Place in `server`.
4. Is it a generic utility, token, or primitive UI with no domain knowledge?
   - Yes → `shared` (utilities/tokens) or `ui` (primitive components).
5. Route files and data fetching for pages?
   - Prefer `src/app` server components that call into `modules` (for data and module UI) and render `shell` (for composition).

---

## Do/Don't by layer

- shell
  - Do: Compose multiple modules into pages; host nav, providers, guards, boundaries.
  - Don't: Implement domain rules, hit databases, or define generic utilities.

- modules
  - Do: Keep domain logic, validation schemas, and module-scoped UI; expose clean, reusable APIs.
  - Don't: Own app-wide layout or cross-module navigation.

- shared/ui
  - Do: Provide foundational building blocks without domain coupling.
  - Don't: Import from modules or shell.

- server
  - Do: Hold shared, cross-cutting server-only infrastructure (DB connection, cookies, crypto).
  - Don't: Contain client UI, or feature-specific repositories/actions (those belong in the module).

---

## Examples

- Dashboard page that shows cards (payments), chart (revenues), and latest invoices:
  - Composition in `shell` (page/layout + orchestration)
  - Underlying widgets provided by their respective `modules/*`

- Authentication:
  - Domain rules, use cases, schemas, repositories, server actions, and module UI all live in `modules/auth` (across its
    `domain`/`application`/`infrastructure`/`presentation` layers)
  - It reuses shared server infra from `server` (the DB connection, cookies, crypto) rather than reimplementing it
  - If the sidebar needs a logout button or role-aware links, the sidebar lives in `shell`, consuming `modules/auth`
    UI or actions.

---

By separating domain modules from app composition in `shell`, you keep modules reusable, maintain clear import
boundaries, and simplify testing and scaling of both the UI and the backend.

---

_Last updated: 2026-06-24_
