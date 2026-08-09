# Project Structure

Use this guide to decide where code belongs and how layers interact.

> **What this doc owns:** placement across the **top level of `src/`** — which of `modules`,
> `shared`, `shell`, `server`, `ui`, or `app` a file belongs to, and which of those may import
> which. Layering **inside** a module (`domain` → `application` → `infrastructure` →
> `presentation`) is owned by
> [standards/clean-architecture-standards.md](standards/clean-architecture-standards.md), and what
> a file is called is owned by
> [standards/naming-conventions-and-organization.md](standards/naming-conventions-and-organization.md).
> Where this doc and a standard both mention a rule, the standard wins on detail and this doc wins
> on which directory.
>
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

## 2) Apply import-boundary restrictions

- shared: May only import from shared. Lowest-level utilities, tokens, and primitives.
- ui: Base, reusable UI primitives and patterns (atoms/molecules). May import from shared.
- modules: A domain slice, internally layered (presentation/application/domain/infrastructure). May import from modules (itself/peers) and shared/ui. Must not import from shell.
- shell: App composition/orchestration. May import from modules, shared, ui. Should not be imported by modules.
- server: **Shared, cross-cutting** server-only infrastructure (the DB connection, cookies, crypto) — not feature repositories or actions, which live inside each module. Keep server code server-only.
- app (Next.js): Routes and server components. Should delegate domain logic to modules (and shared server infra) and composition to shell.

One-way dependency rule of thumb:
shared/ui -> modules -> shell -> app
the shared `server` infra is usable from modules/shell/app as needed.

Two refinements live elsewhere, deliberately: which of a _peer module's_ layers you may reach into
is [standards/global-standards.md](standards/global-standards.md#module-boundaries--communication),
and which layers may import `@/server/**` is
[standards/clean-architecture-standards.md](standards/clean-architecture-standards.md#the-server-boundary-server-only-infrastructure).

---

## Purpose of the `src` folder's children

1. `modules` — Domain-centric vertical slices (auth, invoices, customers, users, banner). Each slice is internally layered (`presentation/`, `application/`, `domain/`, `infrastructure/`) and owns:
   - Domain entities, value objects, and policies (`domain/`)
   - Use cases, contracts, schemas, and mappers (`application/`)
   - Its own data access — repositories, DAL, row↔entity mappers (`infrastructure/`)
   - Server actions and module-scoped UI (`presentation/`)

   Not every module needs every layer — `banner`, the thinnest slice, skips `application/`. A layer is added when there is orchestration to put in it, not up front. See [diagrams/module-layers.md](diagrams/module-layers.md) for the per-module map.

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

## Placing a component (TSX)

Components are the case where the four candidate homes look most alike, so they get their own pass.
This section covers _where a component file goes_; how it should look and behave is
[standards/ui-design-standards.md](standards/ui-design-standards.md).

### What each home is for

- **`src/app`** — the App Router contract only: `page.tsx`, `layout.tsx`, `template.tsx`,
  `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`, `default.tsx`, `route.ts`, route
  groups like `(overview)`, and route-local `_components`/`_lib` folders. Keep these files thin —
  read params, invoke loading or an action, delegate rendering. `src/app` is not a component
  library.
- **`src/ui`** — feature-agnostic building blocks: atoms, molecules, wrappers, navigation
  primitives, skeletons, brand, styles, generic form controls. No business vocabulary
  (`invoice`, `user`, `auth`, `dashboard`) and no server actions or feature validation. The test:
  would this still make sense in a different app on the same design system?
- **`src/modules/<feature>/presentation`** — anything speaking one feature's language: its forms,
  tables, panels, empty states, server actions, mappers, transports, view models, and page
  templates. May depend on `src/ui` and its own module's application/domain code.
- **`src/shell`** — app chrome and cross-feature composition: the dashboard sidebar, nav links, the
  composed overview screen. May depend on `src/ui` and several modules' presentation layers; must
  not absorb low-level primitives or re-own URL structure.

### The order to decide in

1. Is it a real Next.js route artifact, or route-local? → `src/app`
2. Does it speak one feature's language or run one feature's workflow? → `src/modules/<feature>/presentation`
3. Does it compose multiple features or define app chrome? → `src/shell`
4. Is it feature-agnostic shared UI? → `src/ui`

If more than one fits, take the **more specific** owner. Promoting a component from feature-local to
shared later is easy; cleaning feature semantics back out of `src/ui` after they spread is not.

### Signals a file is in the wrong home

- In `src/ui` but its name, props, or copy says `auth`, `invoice`, `user`, or `dashboard`.
- In a module's `presentation` but other features import it as a generic building block.
- In `src/shell` but it has stopped composing features and become a visual primitive.
- In `src/app` but it is neither a route convention file nor genuinely route-local.

### Reserve `layout.tsx` and `template.tsx` for routes

In this codebase `layout.tsx` and bare `template.tsx` mean App Router files, so don't reuse those
names for ordinary wrappers elsewhere. Outside `src/app`, name the concept: `templates/` for
page-level feature wrappers, `wrappers/` for narrow structural ones, `frames/` for larger
compositions inside a feature, `sections/` for self-contained page sections. Prefer a descriptive
filename — `auth-page-template.tsx` over `template.tsx`.

Current files worth copying as references:
`src/modules/auth/presentation/authn/components/shared/wrappers/auth-page-template.tsx` (feature
page scaffold), `src/shell/dashboard/components/dashboard-sidebar.tsx` (app chrome),
`src/shell/dashboard/components/dashboard-overview.tsx` (composed screen), and
`src/ui/molecules/page-header.molecule.tsx` (shared molecule — keep it feature-neutral).

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

_Last updated: 2026-08-05 — absorbed the durable placement rules from the retired
`ui-refactor-strategy.md`._
