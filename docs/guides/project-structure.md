# Project Structure

Use this guide to decide where code belongs and how layers interact.

## 1) Identify the concern: domain capability vs. page/layout composition

- Domain capability: A cohesive business area with its own models, rules, and reusable UI (e.g., auth, invoices, customers).
- Page/layout composition: App “chrome” and orchestration that stitches together multiple features for a route (e.g., dashboard pages, sidebars, nav, guards, providers).

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

- Infrastructure (system setup, deployment, and technical foundation)
    - Database Layer
        - Database setup and migrations
        - Connection pooling
        - Query optimization
        - Data backup and recovery
    - API Layer
        - REST/GraphQL endpoints
        - API versioning
        - Rate limiting
        - Request/Response handling
    - Security
        - Authentication middleware
        - Authorization controls
        - SSL/TLS configuration
        - CORS policies
    - Deployment
        - CI/CD pipelines
        - Container configurations
        - Environment management
        - Health monitoring
    - Performance
        - Caching strategies
        - Load balancing
        - Resource optimization
        - Performance monitoring
    - Integration
        - Third-party services
        - Message queues
        - External APIs
        - Webhooks

## 3) Apply import-boundary restrictions

- shared: May only import from shared. Lowest-level utilities, tokens, and primitives.
- ui: Base, reusable UI primitives and patterns (atoms/molecules). May import from shared.
- features: A domain slice. May import from features (itself/peers) and shared/ui. Must not import from shell.
- shell: App composition/orchestration. May import from features, shared, ui. Should not be imported by features.
- server: Infrastructure, actions, services, repositories. No import restrictions (but keep server code server-only).
- app (Next.js): Routes and server components. Should delegate domain logic to server/features and composition to shell.

One-way dependency rule of thumb:
shared/ui -> features -> shell -> app
server is usable from features/shell/app as needed.

---

## Purpose of the `src` folder's children

1. `features` — Domain-centric slices (auth, invoices, customers, users, etc.). Each slice exposes:
    - Domain types, schemas, and view-model mappers
    - Reusable, feature-scoped UI
    - Light adapters that are feature-specific (no DB or external I/O)

2. `shared` — Cross-cutting, feature-agnostic utilities and tokens:
    - Pure helpers, constants, types
    - Design tokens, formatting utilities
    - Must not depend on features or shell

3. `shell` — Application composition layer (the “app chrome” and orchestration).
    - What it owns:
        - Route and section layouts (e.g., dashboard layout, root frame)
        - Navigation (sidebars, top bars, breadcrumbs) with active state
        - Cross-feature wrappers and gates (auth/role guards)
        - App-wide providers (theme, toasts), error and suspense boundaries
        - Page-level compositions that stitch multiple features together (e.g., a dashboard page showing cards, charts, and lists from several features)
    - What it avoids:
        - Domain/business logic (keep in features/server)
        - Data access or external API calls (keep in server)
        - Generic utilities (keep in shared)
    - Why “dashboard” was suggested to be moved here:
        - “Dashboard” in this codebase primarily composes multiple domain features into a single screen (cards, charts, latest items) and controls navigation/layout. That is app composition—not a single domain capability—so it belongs in shell.

4. `server` — Infrastructure and backend-facing code:
    - Database access, repositories, migrations
    - Services and server actions
    - Integration with external systems (OAuth, queues, webhooks)

5. `ui` — Base UI primitives intended for reuse and extension:
    - Atoms/molecules (buttons, inputs, wrappers)
    - No domain knowledge; may import tokens/utilities from shared

---

## Placement decision tree

1. Is it app chrome or cross-feature composition (layouts, nav, role gates, dashboard composition)?
    - Yes → Place in `shell`.
2. Is it a domain capability with reusable UI and types (auth, invoices, customers)?
    - Yes → Place in `features/<feature>`.
3. Is it infrastructure (DB, services, actions, external APIs)?
    - Yes → Place in `server`.
4. Is it a generic utility, token, or primitive UI with no domain knowledge?
    - Yes → `shared` (utilities/tokens) or `ui` (primitive components).
5. Route files and data fetching for pages?
    - Prefer `src/app` server components that call into `server` (for data) and render `shell` (for composition) and `features` (for feature UI).

---

## Do/Don’t by layer

- shell
    - Do: Compose multiple features into pages; host nav, providers, guards, boundaries.
    - Don’t: Implement domain rules, hit databases, or define generic utilities.

- features
    - Do: Keep domain logic, validation schemas, and feature-scoped UI; expose clean, reusable APIs.
    - Don’t: Own app-wide layout or cross-feature navigation.

- shared/ui
    - Do: Provide foundational building blocks without domain coupling.
    - Don’t: Import from features or shell.

- server
    - Do: Encapsulate data access and integrations; expose actions/services.
    - Don’t: Contain client UI.

---

## Examples

- Dashboard page that shows cards (payments), chart (revenues), and latest invoices:
    - Composition in `shell` (page/layout + orchestration)
    - Underlying widgets provided by their respective `features/*`

- Authentication:
    - Forms, schemas, roles, and client helpers in `features/auth`
    - Server actions and provider integrations in `server/auth`
    - If the sidebar needs a logout button or role-aware links, the sidebar lives in `shell`, consuming `features/auth` UI or actions.

---

By separating domain features from app composition in `shell`, you keep features reusable, maintain clear import boundaries, and simplify testing and scaling of both the UI and the backend.
