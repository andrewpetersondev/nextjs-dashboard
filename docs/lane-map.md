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
| **app / shell**     | `src/app/**`, `src/shell/**` (route glue, layouts, page wiring)     | ✅ (see caveat below)       |
| **docs**            | `docs/**` (stable areas not under active code change)               | ✅                          |
| **chore**           | one isolated file/config (a dep, `tsconfig`, a font)                | ✅ (if footprints disjoint) |
| **kernel / schema** | `src/shared/**`, `src/ui/**`, `src/server/**`, `database/schema/**` | ⛔ **single-thread**        |

The kernel row is the exception: cross-cutting changes to shared code, the design system, infra, or the
DB schema should be **one session at a time**, because everything depends on them. Don't run two kernel
refactors at once, and don't run a kernel refactor next to a module lane it will break.

The **app / shell** row is parallel-safe against the module lanes — `src/app` imports the modules but does not edit them — with one caveat: it is where a feature's _routes_ live, so a module lane that adds or moves a page lands in the same footprint. Run it beside module lanes doing in-place work, not beside one building a new screen.

## How many at once

The realistic ceiling isn't the kernel or your tokens — it's **your steering bandwidth**. Two or three
sessions you can actually review and unblock beats five you can't. Start with 2, grow toward ~4 once the
rhythm is comfortable. Each lane is its own worktree branch off `main`, merged back into `main` locally
when done.

## Today's BACKLOG, mapped onto lanes

Every open item in [`BACKLOG.md`](../BACKLOG.md) appears here, so a gap in this table means the table
is stale rather than the item being untracked. Footprints below were read off the files, not inferred.

| BACKLOG item             | Lane                     | Edit footprint                                                                 | Blocked on                                        |
| ------------------------ | ------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------- |
| `@types/node` blind spot | chore (tooling)          | `devtools/cli/node-version-drift.cli.ts`                                       | nothing — ready                                   |
| TSDoc coverage pass      | app / shell              | `src/app/**` (29 files, comments only)                                         | nothing — ready                                   |
| Skills exploration       | research (no code)       | none                                                                           | nothing — ready                                   |
| CSP follow-ups (#126)    | ⛔ **kernel**            | `src/shared/http/server/security-headers.ts`, `src/proxy.ts`, `next.config.ts` | decisions — see below                             |
| Action-guard asymmetry   | customers **+** invoices | 9 `*.action.ts` under `src/modules/{customers,invoices}/presentation/actions/` | your call — consistency work, not a fix           |
| `next` 16.3.x hold       | chore (deps)             | `package.json`, `pnpm-workspace.yaml`                                          | upstream — a stable release containing `c7b87c23` |

**Three are ready and mutually disjoint** — the tooling CLI, `src/app`, and a no-code research task
share no files, so they are a genuine three-lane run if you want one. That is the most parallelism
this list currently offers.

**Correction, 2026-09-03: CSP follow-ups is kernel work, not a chore lane.** This table previously
gave its footprint as `next.config.ts, proxy.ts` and filed it under `chore (security)`, which would
have invited running it beside another lane. The policy is actually built in
`src/shared/http/server/security-headers.ts` — `src/proxy.ts` imports the builder to attach the
per-request nonce, and `next.config.ts` only imports `STATIC_SECURITY_HEADERS` — so the real
footprint lands in `src/shared/**`, which this document's own rule marks **single-thread**. Its
tests (`src/shared/http/__tests__/unit/security-headers.test.ts`) and the invariant guard
(`devtools/cli/csp-guard.cli.ts`) move with it. Do not run it next to any other kernel work.

**Three are not blocked on effort.** The CSP work needs decisions that do not exist yet
(`require-trusted-types-for` wants a report collector; the HSTS `includeSubDomains` call cannot be made
until there is a custom domain). The `next` hold lifts only when upstream ships a stable release
containing the fix — 16.3.1 and the closed issue are both false go-signals. The action-guard item is
consistency work behind a verdict of _not a vulnerability_, so it waits on you, not on capacity.

**The action-guard item is the only one that spans two lanes.** Its nine files sit in `customers` and
`invoices`, so running it occupies both module lanes at once — or splits into two sessions along the
3/6 module boundary, which is clean since the files do not import each other. Don't start it beside
a `customers` or `invoices` feature lane either way.

Renovate (#124) is **dropped, not pending** — do not re-add it here.

## The protocol

1. Pick lanes with disjoint edit footprints (use the tables above).
2. Give each its own worktree branch off `main`.
3. When a lane is green (`pnpm check:fast`), merge it into `main` locally; CI runs on the push.
4. If a task must touch the **kernel / schema**, run it **solo** — pause module lanes it could break.
5. Push `main` after each landed lane — Vercel builds production on every push to `main`.

## Keeping this honest

This maps the dependency graph as of now (`auth`⇄`users` coupled; `invoices` downstream of `auth` +
`customers`; schema centralized in `database/schema/`). If you split a module, add a cross-module
import, or move the schema, re-derive the coupling — `grep -rho '@/modules/[a-z-]*' src/modules/<m>`
shows what a module imports.
