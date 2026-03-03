# Project Structure

Use this guide to decide where code belongs and how layers interact.

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
- modules: A domain slice. May import from modules (itself/peers) and shared/ui. Must not import from shell.
- shell: App composition/orchestration. May import from modules, shared, ui. Should not be imported by modules.
- server: Infrastructure, actions, services, repositories. No import restrictions (but keep server code server-only).
- app (Next.js): Routes and server components. Should delegate domain logic to server/modules and composition to shell.

One-way dependency rule of thumb:
shared/ui -> modules -> shell -> app
server is usable from modules/shell/app as needed.

---

## Purpose of the `src` folder's children

1. `modules` — Domain-centric slices (auth, invoices, customers, users, etc.). Each slice exposes:
    - Domain types, schemas, and view-model mappers
    - Reusable, module-scoped UI
    - Light adapters that are module-specific (no DB or external I/O)

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

4. `server` — Infrastructure and backend-facing code:
    - Database access, repositories, migrations
    - Services and server actions
    - Integration with external systems (OAuth, queues, webhooks)

5. `ui` — Base UI primitives intended for reuse and extension:
    - Atoms/molecules (buttons, inputs, wrappers)
    - No domain knowledge; may import tokens/utilities from shared

---

## Placement decision tree

1. Is it app chrome or cross-module composition (layouts, nav, role gates, dashboard composition)?
    - Yes → Place in `shell`.
2. Is it a domain capability with reusable UI and types (auth, invoices, customers)?
    - Yes → Place in `modules/<module>`.
3. Is it infrastructure (DB, services, actions, external APIs)?
    - Yes → Place in `server`.
4. Is it a generic utility, token, or primitive UI with no domain knowledge?
    - Yes → `shared` (utilities/tokens) or `ui` (primitive components).
5. Route files and data fetching for pages?
    - Prefer `src/app` server components that call into `server` (for data) and render `shell` (for composition) and
      `modules` (for module UI).

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
    - Do: Encapsulate data access and integrations; expose actions/services.
    - Don't: Contain client UI.

---

## Examples

- Dashboard page that shows cards (payments), chart (revenues), and latest invoices:
    - Composition in `shell` (page/layout + orchestration)
    - Underlying widgets provided by their respective `modules/*`

- Authentication:
    - Forms, schemas, roles, and client helpers in `modules/auth`
    - Server actions and provider integrations in `server/auth`
    - If the sidebar needs a logout button or role-aware links, the sidebar lives in `shell`, consuming `modules/auth`
      UI or actions.

---

By separating domain modules from app composition in `shell`, you keep modules reusable, maintain clear import
boundaries, and simplify testing and scaling of both the UI and the backend.

---

_Last updated: 2026-03-03_
