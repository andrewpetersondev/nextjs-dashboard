# Documentation

How to run, build, and reason about this dashboard. The prose here explains the
rules and the setup; the diagrams in [diagrams/](diagrams/) show the shapes. If
you're new, start with [getting-started.md](getting-started.md) and work down.

Each entry says *what question it answers*, so you can scan for the one you have.
Some of the code is documented in place, too: many folders under `src/modules/**`
and `src/shared/**` carry a local `README.md` — most thoroughly the `auth` module,
which documents each of its layers; the other feature modules — `invoices`,
`users`, `customers`, and `banner` — each have a module-level overview. This
folder is for the cross-cutting, project-wide docs.

## Getting started & local setup

| Doc | The question it answers |
|---|---|
| [getting-started.md](getting-started.md) | "I just cloned this — how do I install, configure, and run it locally?" |
| [database-setup.md](database-setup.md) | "How do I stand up PostgreSQL in Docker and create the dev / test / prod databases?" |
| [drizzle.md](drizzle.md) | "How do I generate migrations, seed data, and reset the database?" |

## Testing

| Doc | The question it answers |
|---|---|
| [testing.md](testing.md) | "How do I run the unit (Vitest) and E2E (Cypress) suites, locally and in CI?" |

## Build tooling & configuration

| Doc | The question it answers |
|---|---|
| [package-json-scripts-guide.md](package-json-scripts-guide.md) | "What does this `pnpm <script>` actually do?" |
| [knip.md](knip.md) | "How do I find unused exports, files, and dependencies?" |
| [tsconfig.md](tsconfig.md) | "How are the TypeScript projects organized, which config owns a file, and where does a compiler option belong?" |

## Architecture & design

| Doc | The question it answers |
|---|---|
| [project-structure.md](project-structure.md) | "Where does this code belong, and which layer may import which?" |
| [shared-architecture.md](shared-architecture.md) | "What belongs in `src/shared`, and how is it organized?" |
| [ui-refactor-strategy.md](ui-refactor-strategy.md) | "Does this component go in `src/app`, `src/ui`, or a module's `presentation`?" |
| [when-to-use-app-error.md](when-to-use-app-error.md) | "Should this failure be an `AppError` or a domain policy outcome?" |
| [diagrams/](diagrams/) | The visual companion — sequence, ERD, C4, state, and layering diagrams. See its [README](diagrams/README.md). |

## Architecture decisions (ADRs)

Numbered, immutable records of *why* a design choice was made — its context, the
decision, and the consequences. They live beside the code that embodies them, in
[`src/modules/auth/notes/adr/`](../src/modules/auth/notes/adr/). They grew out of
the auth module, but several capture patterns — `Result` types, branded IDs, the
command / query split — that the rest of the codebase follows too.

| ADR | The question it answers |
|---|---|
| [001 — Result type for error handling](../src/modules/auth/notes/adr/001-use-result-type-for-error-handling.md) | "Why do functions return `Result<T, E>` instead of throwing exceptions?" |
| [002 — Separate commands and queries](../src/modules/auth/notes/adr/002-separate-commands-and-queries.md) | "Why are state-changing use cases kept apart from read-only queries?" |
| [003 — Branded types for IDs](../src/modules/auth/notes/adr/003-use-branded-types-for-ids.md) | "Why is a `UserId` a branded type and not a plain `string`?" |
| [004 — Strip passwords at the application boundary](../src/modules/auth/notes/adr/004-strip-passwords-at-application-boundary.md) | "Where do password hashes get dropped as data moves up the layers?" |
| [005 — JWT for session tokens](../src/modules/auth/notes/adr/005-use-jwt-for-session-tokens.md) | "Why stateless JWT-in-cookie sessions instead of a server-side store?" |
| [006 — Prevent credential enumeration](../src/modules/auth/notes/adr/006-prevent-credential-enumeration.md) | "How does login avoid leaking whether an email is registered?" |

## Keeping them honest

Treat every doc here as a **snapshot**, not a contract. When you change a flow, a
script, or a config, update the doc in the same PR — or ask Claude to redraw it
from the current code. A doc that lies is worse than no doc; when a detail
matters, verify it against the code before trusting it.
