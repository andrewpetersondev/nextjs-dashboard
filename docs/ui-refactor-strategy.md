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
    - `page.tsx`, `layout.tsx`, `template.tsx`, `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`,
      `default.tsx`, `route.ts`
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

### Reserve `layout.tsx` and bare `template.tsx` for Next.js route files

In this codebase, `layout.tsx` should mean an App Router layout file, and bare `template.tsx` should mean an App
Router template file.

- Keep the term `layout` for files such as `src/app/layout.tsx` or `src/app/dashboard/layout.tsx`.
- Keep bare `template.tsx` only for real route templates under `src/app`.
- Avoid using `layout` for generic wrappers under `src/ui` or `src/modules/*/presentation`.
- Outside `src/app`, prefer descriptive names like `auth-page-template.tsx` over ambiguous convention-like names such as
  `layout.tsx` or `template.tsx`.

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

### Naming outcomes already reflected in the repo

These examples are now useful as naming references because the repo already reflects them:

- `src/modules/auth/presentation/authn/components/shared/wrappers/auth-page-template.tsx`
    - Use as the reference shape for a feature-level page scaffold.
    - Reason: it avoids App Router `layout.tsx` naming while still making template ownership explicit.
- `AuthPageTemplate`
    - Use as the preferred auth page scaffold name.
    - Reason: it reads as feature presentation, not as a route convention file.
- `src/shell/dashboard/components/dashboard-sidebar.tsx`
    - Use as the reference shell name for dashboard chrome.
    - Reason: `sidebar` is clearer than older `sidenav` wording when the component owns dashboard navigation chrome.
- `DashboardSidebar`
    - Use as the preferred component name for the dashboard shell sidebar.
    - Reason: the shell layer benefits from explicit app-chrome names.
- `src/shell/dashboard/components/dashboard-nav-links.tsx`
    - Use as the reference name when a file owns dashboard navigation content.
    - Reason: it is more descriptive than vague wrapper terminology.
- `DashboardNavLinks`
    - Use as the preferred component name for dashboard navigation link composition.
    - Reason: the name describes ownership and purpose directly.
- `src/shell/dashboard/components/dashboard-overview.tsx`
    - Use as the reference name for the composed overview screen inside dashboard shell.
    - Reason: it is more precise than a redundant file named only `dashboard.tsx` inside a `dashboard` folder.
- `DashboardOverview`
    - Use as the preferred component name for the dashboard overview composition.
    - Reason: the name communicates that the component is a specific screen-level shell composition.

Use these as reference points for future naming. Rename only when the new name clarifies ownership, scope, or App
Router terminology.

## Current Repository Placement Examples

Use the current codebase as the reference for what should stay where.

### Good examples to preserve

- `src/app/layout.tsx`
    - Keep in `src/app` because it is the root App Router layout and owns route-level metadata and chrome entry.
- `src/app/dashboard/layout.tsx`
    - Keep in `src/app` because it is a real route layout that delegates rendering to shell and feature code.
- `src/app/auth/login/page.tsx`
    - Keep in `src/app` because it is the route entrypoint, but keep it thin and continue delegating to feature
      presentation.
- `src/modules/auth/presentation/authn/components/shared/wrappers/auth-page-template.tsx`
    - Keep in auth presentation because it is a feature-local page template, not app-wide shell.
- `src/shell/dashboard/components/dashboard-sidebar.tsx`
    - Keep in `src/shell` because it composes branding, navigation, and auth logout into dashboard chrome.
- `src/ui/molecules/page-header.tsx`
    - Keep in `src/ui` as long as it stays feature-neutral and does not absorb auth-specific behavior.

### Signals that a file is in the wrong layer

- Move out of `src/ui` when the file name, props, or copy includes feature words like `auth`, `invoice`, `user`, or
  `dashboard`.
- Move out of `src/modules/*/presentation` when multiple features start importing it as a general-purpose building
  block.
- Move out of `src/shell` when the file stops composing multiple features and becomes a low-level visual primitive.
- Move out of `src/app` when the file is not a Next.js route convention file and is not truly route-local.

## Incremental Move Queue

These are the next practical moves to make the strategy operational without forcing a rewrite.

### Pass A: stabilize the auth feature as the reference example

- Keep `src/modules/auth/presentation/authn/components/shared/wrappers/auth-page-template.tsx` as the naming reference
  for
  non-route page wrappers.
- Prefer future auth page-level wrappers under `presentation/templates/` when they define page structure and under
  `presentation/wrappers/` when they are narrower structural helpers.
- Keep actions such as `login.action.ts` and `logout.action.ts` in auth presentation because they directly serve feature
  UI flows.
- Avoid moving auth-specific prompts, cards, or forms into `src/ui` unless they lose auth language completely.

### Pass B: align other features to the same presentation vocabulary

- `src/modules/invoices/presentation`
    - Keep `actions/`, `components/`, and `forms/` as the base structure.
    - Keep `templates/` available for future invoice page scaffolds, but do not populate it until an invoice-specific
      page template actually emerges.
    - Keep table variants and invoice-specific links inside invoice presentation instead of promoting them to shared UI.
- `src/modules/users/presentation`
    - Keep user forms and tables feature-local.
    - Prefer `components/` for user-specific selectors and panels, even when they look visually generic.
    - Keep `templates/` reserved for a reusable user page scaffold, but leave it empty unless create/edit screens truly
      converge.

### Pass C: tighten shell boundaries

- Keep dashboard navigation and sidebar chrome in `src/shell/dashboard/components`.
- Keep `src/shell/dashboard/frames/` reserved for larger shell-owned compositions, such as a reusable dashboard
  workspace frame, rather than filling it with one-off wrappers.
- Do not move feature-owned widgets into shell just because they render inside the dashboard.

### Pass D: protect `src/ui` from semantic creep

- Keep neutral building blocks like `PageHeader` in `src/ui` only while their API stays generic.
- If `PageHeader` or similar molecules gain auth-only defaults, invoice-specific actions, or dashboard-only copy, split
  those into feature-level wrappers that compose the shared UI primitive.
- Prefer adding thin feature wrappers in `src/modules/*/presentation` over stuffing branching feature behavior into
  shared UI.

## Placement Checklist For New TSX Files

Before creating a new component, answer these questions in order:

1. Is this file a real Next.js route artifact such as `page.tsx`, `layout.tsx`, `loading.tsx`, or a route-local
   `_components` helper?
    - Yes → place it in `src/app`.
2. Does the component speak in one feature's language or orchestrate one feature's workflow?
    - Yes → place it in `src/modules/<feature>/presentation`.
3. Does it compose app chrome or multiple features into one surface?
    - Yes → place it in `src/shell`.
4. Could the same component be reused in another app without bringing feature semantics along?
    - Yes → place it in `src/ui`.

If you still hesitate after step 4, default to the more specific owner first. It is easier to promote a component from
feature-local to shared later than to clean feature semantics out of `src/ui` after they spread.

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

Also keep this naming distinction in mind:

- `layout.tsx` and bare `template.tsx` are App Router conventions and belong in `src/app`
- `templates/` as a folder under feature presentation is still acceptable for descriptive, non-route page scaffolds
- descriptive filenames like `auth-page-template.tsx` are clearer than generic filenames like `template.tsx`

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

