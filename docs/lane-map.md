# Lane map — running sessions in parallel

> The question this answers: _"If I want to run several Claude sessions (or tasks) at once, how do I
> split the work so they don't collide?"_ The visual companion is
> [diagrams/lane-map.md](diagrams/lane-map.md); the branch mechanics are in
> [branching-and-releases.md](branching-and-releases.md).

## The one rule

Two sessions collide only when they **edit the same files** — not when they import the same files. A
"lane" is a slice of work whose **edit footprint** doesn't overlap another lane's. Two lanes can both
_depend on_ `src/shared/core`; they conflict only if both _change_ it. So parallelizing safely is mostly
about picking work whose edits land in different places.

## The dependency reality (verified, not assumed)

The codebase has three tiers — the documented rule is `shared/ui → modules → shell → app` (see
[project-structure.md](project-structure.md)):

- **Shared kernel** — `src/shared/**`, `src/ui/**`, `src/server/**`, and the centralized
  `database/schema/**`. Almost everything imports these, so an edit here ripples into every lane.
- **Feature modules** — `src/modules/*`, the domain slices. These are the parallel lanes — but they are
  **not all independent**:

  | Module      | Coupling (verified via imports)     | Lane                       |
  | ----------- | ----------------------------------- | -------------------------- |
  | `auth`      | imports `users` (mutual)            | **one lane with `users`**  |
  | `users`     | imports `auth` (mutual)             | (same lane as `auth`)      |
  | `customers` | none                                | standalone lane            |
  | `banner`    | none                                | standalone lane            |
  | `invoices`  | reads `auth`, `customers` (one-way) | own lane, but _downstream_ |

  `auth` and `users` import each other, so they must move together as a single lane. `invoices` _reads_
  `auth` and `customers` but doesn't edit them — it's its own edit footprint, just downstream: fine to
  run beside the others, with the caveat that if an upstream lane changes a contract `invoices` uses,
  `invoices` may need a follow-up (CI's type-check catches it at integration).

- **Composition** — `src/app/**`, `src/shell/**`. Thin, route-specific glue at the top of the stack.

## The lanes

| Lane                | Edit footprint                                                      | Parallel?                   |
| ------------------- | ------------------------------------------------------------------- | --------------------------- |
| **auth + users**    | `src/modules/auth`, `src/modules/users`                             | ✅ (one lane, both modules) |
| **customers**       | `src/modules/customers`                                             | ✅                          |
| **invoices**        | `src/modules/invoices`                                              | ✅ (downstream — see above) |
| **banner**          | `src/modules/banner`                                                | ✅                          |
| **docs**            | `docs/**` (stable areas not under active code change)               | ✅                          |
| **chore**           | one isolated file/config (a dep, `tsconfig`, a font)                | ✅ (if footprints disjoint) |
| **kernel / schema** | `src/shared/**`, `src/ui/**`, `src/server/**`, `database/schema/**` | ⛔ **single-thread**        |

The kernel row is the exception: cross-cutting changes to shared code, the design system, infra, or the
DB schema should be **one session at a time**, because everything depends on them. Don't run two kernel
refactors at once, and don't run a kernel refactor next to a module lane it will break.

## How many at once

The realistic ceiling isn't the kernel or your tokens — it's **your steering bandwidth**. Two or three
sessions you can actually review and unblock beats five you can't. Start with 2, grow toward ~4 once the
rhythm is comfortable. Each lane is its own worktree + branch off `develop`, opening its own PR.

## Today's BACKLOG, mapped onto lanes

Most open items are tooling/docs/config rather than feature work, which makes them _very_
parallel-friendly:

| BACKLOG item                  | Lane                       | Edit footprint                 |
| ----------------------------- | -------------------------- | ------------------------------ |
| docs/ consolidation           | docs                       | `docs/standards/**`, `docs/**` |
| Font experiment (finish/drop) | chore (UI)                 | `src/ui/styles/fonts.ts`       |
| TSConfig modernization        | chore (config)             | `tsconfig*.json`               |
| Renovate adoption             | chore (CI/config)          | CI + workspace config          |
| Integration lane in CI        | chore (CI)                 | `.github/workflows/ci.yml`     |
| Skills exploration            | research (no code)         | none                           |
| **Forms taxonomy flattening** | **kernel — single-thread** | `src/shared/forms/**`          |

A clean four-session day right now could be **docs consolidation** + **font experiment** + **TSConfig
modernization** + **skills exploration** — four near-disjoint footprints. **Forms taxonomy flattening**
is the one to keep solo: it lives in the shared kernel, so don't pair it with another kernel task.

## The protocol

1. Pick lanes with disjoint edit footprints (use the tables above).
2. Give each its own worktree + branch off `develop`.
3. Let each open its own PR into `develop`; the fast `Lint & type-check` gate runs per PR.
4. If a task must touch the **kernel / schema**, run it **solo** — pause module lanes it could break.
5. Promote `develop → main` with `/promote` once the integrated set is coherent.

## Keeping this honest

This maps the dependency graph as of now (`auth`⇄`users` coupled; `invoices` downstream of `auth` +
`customers`; schema centralized in `database/schema/`). If you split a module, add a cross-module
import, or move the schema, re-derive the coupling — `grep -rho '@/modules/[a-z-]*' src/modules/<m>`
shows what a module imports.
