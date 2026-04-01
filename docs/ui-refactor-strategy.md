# UI Refactor Strategy

## Created 2026-04-01

## Goals

- Reduce ambiguity between `src/ui`, `src/shell`, `src/modules/*/presentation`, and `src/app`.
- Reserve Next.js routing terms for actual App Router concerns.
- Make component placement predictable enough that new files can be added without case-by-case debate.
- Refactor incrementally, using the current structure as a base instead of rewriting it wholesale.

## Placement Rules

### `src/app`: route contract and Next.js file conventions

Put code in `src/app` only when it is part of the App Router contract or needs to live beside a route segment.

- Allowed here:
    - `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`
    - route-group organization like `(dashboard)`
    - private colocation folders like `_components` or `_lib` when something is route-local and should not become shared
- Keep `src/app` files thin:
    - receive params/search params
    - invoke route-level data loading or actions
    - delegate rendering to feature presentation or shell components
- Do not grow `src/app` into a general-purpose component library.

### `src/ui`: shared visual building blocks

Put code in `src/ui` when it is feature-agnostic and reusable across multiple domains.

- Allowed here:
    - primitives, atoms, neutral molecules, icons, typography, design tokens
    - generic form controls and field wrappers with no feature language
    - visual utilities like `cn`, shared skeletons, shared navigation primitives
- Rules:
    - no business vocabulary such as `invoice`, `user`, `auth`, or `dashboard` unless the item is truly brand-wide and
      domain-neutral
    - no feature workflows, server actions, or feature-specific validation logic
    - prefer composition props over embedding domain behavior
- If a component would still make sense in another app using the same design system, it likely belongs in `src/ui`.

### `src/modules/*/presentation`: feature-specific UI and interaction

Put code in `src/modules/<feature>/presentation` when it expresses feature language, feature workflows, or
feature-specific UI composition.

- Allowed here:
    - feature forms, cards, tables, panels, empty states, and feature-specific sections
    - server actions used by the feature UI
    - presentation adapters, mappers, transports, view models
    - wrappers/templates used only inside a single feature
- Rules:
    - this layer may depend on `src/ui` and the feature's application/domain code
    - this layer should not become app-wide shell or navigation unless it is still feature-owned
    - if another feature starts importing it for generic reuse, reevaluate whether it belongs in `src/ui` or `src/shell`

### `src/shell`: cross-feature app composition and chrome

Put code in `src/shell` when it composes multiple features or provides application-level structure.

- Allowed here:
    - side navigation, workspace chrome, dashboard frame, top-level composed screens
    - components that combine multiple modules into one app surface
    - app-level wrappers that are broader than any single feature but are not App Router `layout.tsx` files
- Rules:
    - `src/shell` may depend on `src/ui` and multiple feature presentation layers
    - `src/shell` should not absorb low-level UI primitives
    - `src/shell` should not become a duplicate routing layer; route files in `src/app` still own URL structure

## Naming Rules

### Reserve `layout` for Next.js route layouts

In this codebase, `layout.tsx` should mean an App Router layout file.

- Keep the term `layout` for files such as `src/app/layout.tsx` or `src/app/dashboard/layout.tsx`.
- Avoid using `layout` for generic wrappers under `src/ui` or `src/modules/*/presentation`.

### Prefer other names for non-route wrappers

For reusable wrappers that are not App Router layouts, prefer one of these concepts:

- `templates/`: page-level feature wrappers
- `wrappers/`: narrow structural wrappers
- `frames/`: larger compositional shells inside a feature
- `sections/`: self-contained page sections

Examples:

- `auth-page-wrapper.tsx` should eventually live under something like `presentation/templates/` or
  `presentation/wrappers/`
- `src/ui/layouts/...` should eventually become `src/ui/wrappers/...` or another non-route term

### Concrete renaming opportunities to queue

These are good candidates for the first naming pass because they currently blur route-layout language,
shared-ui language, or shell language.

- `src/modules/auth/presentation/authn/components/shared/layout/`
    - Rename folder to `shared/templates/` or `shared/wrappers/`
    - Reason: `layout` collides with App Router terminology, while this code is feature-local presentation
- `src/modules/auth/presentation/authn/components/shared/layout/auth-page-wrapper.tsx`
    - Preferred rename: `auth-page-template.tsx`
    - Acceptable alternative: `auth-page-frame.tsx`
    - Reason: it provides a standard auth page structure, not a Next.js route layout
- `AuthPageWrapper`
    - Preferred rename: `AuthPageTemplate`
    - Acceptable alternative: `AuthPageFrame`
    - Reason: the component is a reusable feature-level page scaffold
- Any future `src/ui/layouts/...` directory
    - Preferred rename: `src/ui/wrappers/...`
    - Acceptable alternative: `src/ui/frames/...`
    - Reason: shared UI should avoid `layout` unless the file is an actual App Router layout file
- `src/shell/dashboard/components/sidenav.tsx`
    - Preferred rename: `dashboard-sidebar.tsx`
    - Reason: `sidebar` is a clearer shell/chrome term than the more generic `sidenav`
- `SideNav`
    - Preferred rename: `DashboardSidebar`
    - Reason: the shell layer should use explicit app-chrome names when the component is dashboard-owned
- `src/shell/dashboard/components/nav-links-wrapper.tsx`
    - Preferred rename: `dashboard-nav.tsx` or `dashboard-nav-links.tsx`
    - Reason: `wrapper` is vague unless the file is truly only a structural wrapper
- `NavLinksWrapper`
    - Preferred rename: `DashboardNav` or `DashboardNavLinks`
    - Reason: the new name explains whether the component owns navigation content instead of just wrapping it
- `src/shell/dashboard/components/dashboard.tsx`
    - Preferred rename: `dashboard-overview.tsx` or `dashboard-screen.tsx`
    - Reason: `dashboard` is too broad inside a folder already named `dashboard`; the file appears to model a specific
      composed screen
- `Dashboard`
    - Preferred rename: `DashboardOverview` or `DashboardScreen`
    - Reason: component names should reveal whether they are app-shell compositions, pages, or generic widgets

Use these as review prompts, not mandatory immediate moves. Rename only when the new name clarifies ownership,
scope, or App Router terminology.

## Decision Framework

When placing a TSX file, use this order:

1. Is it a Next.js route file or route-local artifact required by App Router?
    - Yes → `src/app`
2. Does it encode business language or workflows for one feature?
    - Yes → `src/modules/<feature>/presentation`
3. Does it compose multiple features or define app chrome?
    - Yes → `src/shell`
4. Is it feature-agnostic shared UI?
    - Yes → `src/ui`

If a file seems to fit more than one place, prefer the most specific ownership:

- feature-specific beats shared
- app-shell composition beats generic UI
- route contract beats all other concerns when the file is a real Next.js convention file

## Target Folder Taxonomy

The current structure is close to a workable target. Standardize toward this shape:

```text
src/
  app/                         # routes and Next.js file conventions only
  shell/                       # cross-feature app composition and chrome
    dashboard/
      components/
      frames/
  ui/                          # shared visual building blocks
    atoms/
    molecules/
    wrappers/
    navigation/
    skeletons/
    brand/
    styles/
  modules/
    auth/
      presentation/
        actions/
        components/
        forms/
        templates/
        adapters/
        mappers/
        transports/
        view-models/
    invoices/
      presentation/
        actions/
        components/
        forms/
        templates/
    users/
      presentation/
        actions/
        components/
        forms/
        templates/
```

Not every feature must have every folder, but shared naming should be consistent.

## Incremental Migration Plan

### Phase 1: document and stabilize placement

- Adopt these placement rules before moving files.
- Link this strategy from `README.md`, `AGENTS.md`, or a relevant architecture doc if desired.
- Treat new file placement as more important than immediate bulk moves.

### Phase 2: remove naming ambiguity

- Rename non-route `layout` folders/components to `templates`, `wrappers`, `frames`, or `sections`.
- Start with the most obvious collisions with App Router terminology.
- Keep route `layout.tsx` files unchanged.

### Phase 3: pick a reference feature

- Use `auth` as the reference feature because it already has the strongest presentation structure.
- Simplify its internal naming so it models the target conventions cleanly.
- Use the result as the example to align `users` and `invoices`.

### Phase 4: align remaining features

- Normalize `users` and `invoices` presentation trees to the same conventions.
- Separate feature templates/wrappers from low-level reusable UI.
- Move only when ownership is clearly improved.

### Phase 5: tighten shared layers

- Audit `src/ui` for feature-specific components that leaked into the shared layer.
- Audit `src/shell` for app-composition pieces that are currently scattered elsewhere.
- Keep route files in `src/app` thin by delegating rendering to features or shell components.

## Quick Wins

- Define and enforce these placement rules for all new files starting now.
- Rename non-route `layout` directories first.
- Standardize one feature before attempting repo-wide moves.
- Avoid moving truly generic design-system pieces out of `src/ui` unless they carry feature semantics.

