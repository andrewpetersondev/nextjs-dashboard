# Documentation

How to run, build, and reason about this dashboard. The prose here explains the
rules and the setup; the diagrams in [diagrams/](diagrams/) show the shapes. If
you're new, start with [getting-started.md](getting-started.md) and work down.

Each entry says _what question it answers_, so you can scan for the one you have.
Some of the code is documented in place, too: many folders under `src/modules/**`
and `src/shared/**` carry a local `README.md` — most thoroughly the `auth` module,
which documents each of its layers; the other feature modules — `invoices`,
`users`, `customers`, and `banner` — each have a module-level overview. This
folder is for the cross-cutting, project-wide docs.

## Getting started & local setup

| Doc                                      | The question it answers                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| [getting-started.md](getting-started.md) | "I just cloned this — how do I install, configure, and run it locally?"              |
| [database-setup.md](database-setup.md)   | "How do I stand up PostgreSQL in Docker and create the dev / test / prod databases?" |
| [drizzle.md](drizzle.md)                 | "How do I generate migrations, seed data, and reset the database?"                   |

## Testing

| Doc                      | The question it answers                                                       |
| ------------------------ | ----------------------------------------------------------------------------- |
| [testing.md](testing.md) | "How do I run the unit (Vitest) and E2E (Cypress) suites, locally and in CI?" |

## Branching, CI & releases

| Doc                                                    | The question it answers                                                                            |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| [branching-and-releases.md](branching-and-releases.md) | "Which branch do I work on, how does a change reach production, and what CI runs at each step?"    |
| [lane-map.md](lane-map.md)                             | "If I want to run several Claude sessions at once, how do I split the work so they don't collide?" |
| [deployment.md](deployment.md)                         | "How do I build the standalone image and deploy to Vercel, and what env vars does each need?"      |

### Scheduled agents

Four scheduled agents run outside the push-triggered pipeline, because what they watch changes
without a commit:

| Doc                                                                  | Schedule (Central) | The question it answers                                          |
| -------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------- |
| [prod-watchdog-routine.md](prod-watchdog-routine.md)                 | Daily 06:11        | "Is the live demo actually working right now — including login?" |
| [bot-pr-triage-routine.md](bot-pr-triage-routine.md)                 | Tue & Fri 06:41    | "What is in the PR queue, and what should I do with each one?"   |
| [lighthouse-regression-routine.md](lighthouse-regression-routine.md) | Sun 20:19          | "Have performance, SEO, or best-practices drifted?"              |
| [weekly-maintenance-routine.md](weekly-maintenance-routine.md)       | Sun 21:47          | "What keeps dependencies, codemods, and version pins current?"   |

**Shared scheduling policy**, so each routine's own doc doesn't restate it:

- **Off-peak by design.** Every routine runs outside roughly 08:00–18:00 Central, which keeps them
  clear of peak model-inference load. Weekly work sits on Sunday evening; the daily and twice-weekly
  checks run early morning so their output is waiting at the start of the day.
- **Staggered, never on the hour.** No two routines overlap, and none is scheduled at `:00` — the
  same cron-stampede reasoning `codeql.yml` already follows. The scheduler additionally applies a
  few minutes of deterministic jitter at dispatch, so the actual fire time drifts slightly later
  than the cron string.
- **They run on this machine, while the app is open.** If it is closed when a task is due, the task
  runs at next launch — so an early-morning slot only lands off-peak if the machine is on overnight.
- **Model and reasoning effort are not per-routine settings.** The local scheduler exposes no such
  field, so every routine inherits the app's session model. Cost is therefore controlled inside the
  prompts instead: each one names the exact commands to run, forbids codebase exploration, and exits
  early on the common no-op outcome.

## Build tooling & configuration

| Doc                                                            | The question it answers                                                                                         |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [package-json-scripts-guide.md](package-json-scripts-guide.md) | "What does this `pnpm <script>` actually do?"                                                                   |
| [claude-code-command-guide.md](claude-code-command-guide.md)   | "Which `/` command should I reach for, and when?"                                                               |
| [knip.md](knip.md)                                             | "How do I find unused exports, files, and dependencies?"                                                        |
| [biome.md](biome.md)                                           | "Why is this lint rule off, and how do I trial one before enabling it?"                                         |
| [tsconfig.md](tsconfig.md)                                     | "How are the TypeScript projects organized, which config owns a file, and where does a compiler option belong?" |

## Architecture & design

| Doc                                              | The question it answers                                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| [project-structure.md](project-structure.md)     | "Where does this code belong, which layer may import which, and where does a component go?"                   |
| [shared-architecture.md](shared-architecture.md) | "What belongs in `src/shared`, and how is it organized?"                                                      |
| [diagrams/](diagrams/)                           | The visual companion — sequence, ERD, C4, state, and layering diagrams. See its [README](diagrams/README.md). |

## Coding standards

Detailed, opinionated standards in [standards/](standards/), consulted by AI assistants and humans alike (relocated from the old `.aiassistant/rules/`). Apply each by judgment, based on the files you're touching.

Each rule has one home, so that two docs can't give different answers. The split: **which top-level
directory** a file goes in is [project-structure.md](project-structure.md); **which layer inside a
module** is [clean-architecture-standards.md](standards/clean-architecture-standards.md); **what it
is called** is [naming-conventions-and-organization.md](standards/naming-conventions-and-organization.md);
**how failures are modeled** is [error-handling-and-result-pattern.md](standards/error-handling-and-result-pattern.md).
Where a doc mentions a rule another one owns, it links rather than restates.

| Doc                                                                                                  | The question it answers                                                          |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [standards/global-standards.md](standards/global-standards.md)                                       | "What are the baseline API-compatibility, code-style, and data-integrity rules?" |
| [standards/clean-architecture-standards.md](standards/clean-architecture-standards.md)               | "What are the strict layer boundaries and dependency rules?"                     |
| [standards/error-handling-and-result-pattern.md](standards/error-handling-and-result-pattern.md)     | "How do the `Result` pattern and `AppError` model work?"                         |
| [standards/naming-conventions-and-organization.md](standards/naming-conventions-and-organization.md) | "What are the naming suffixes and file-organization conventions?"                |
| [standards/ui-design-standards.md](standards/ui-design-standards.md)                                 | "What UI principles and accessibility checklist should the UI follow?"           |

## Architecture decisions (ADRs)

Numbered, immutable records of _why_ a design choice was made — its context, the
decision, and the consequences. They live beside the code that embodies them,
numbered per module. They grew out of the auth module, but several capture
patterns — `Result` types, branded IDs, the command / query split — that the
rest of the codebase follows too.

### Auth module — [`src/modules/auth/notes/adr/`](../src/modules/auth/notes/adr/)

| ADR                                                                                                                               | The question it answers                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [001 — Result type for error handling](../src/modules/auth/notes/adr/001-use-result-type-for-error-handling.md)                   | "Why do functions return `Result<T, E>` instead of throwing exceptions?"                |
| [002 — Separate commands and queries](../src/modules/auth/notes/adr/002-separate-commands-and-queries.md)                         | "Why are state-changing use cases kept apart from read-only queries?"                   |
| [003 — Branded types for IDs](../src/modules/auth/notes/adr/003-use-branded-types-for-ids.md)                                     | "Why is a `UserId` a branded type and not a plain `string`?"                            |
| [004 — Strip passwords at the application boundary](../src/modules/auth/notes/adr/004-strip-passwords-at-application-boundary.md) | "Where do password hashes get dropped as data moves up the layers?"                     |
| [005 — JWT for session tokens](../src/modules/auth/notes/adr/005-use-jwt-for-session-tokens.md)                                   | "Why stateless JWT-in-cookie sessions instead of a server-side store?"                  |
| [006 — Prevent credential enumeration](../src/modules/auth/notes/adr/006-prevent-credential-enumeration.md)                       | "How does login avoid leaking whether an email is registered?"                          |
| [007 — Enforce action-level authorization](../src/modules/auth/notes/adr/007-enforce-action-level-authorization.md)               | "Why do server actions check auth themselves when the middleware already gates routes?" |

### Shared forms module — [`src/shared/forms/notes/adr/`](../src/shared/forms/notes/adr/)

| ADR                                                                                                                                             | The question it answers                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [001 — Model form state as a boundary DTO with null idle](../src/shared/forms/notes/adr/001-model-form-state-as-boundary-dto-with-null-idle.md) | "Why is form state `FormResult<T> \| null` instead of a `Result` variant with an idle member?" |

## Keeping them honest

Treat every doc here as a **snapshot**, not a contract. When you change a flow, a
script, or a config, update the doc in the same PR — or ask Claude to redraw it
from the current code. A doc that lies is worse than no doc; when a detail
matters, verify it against the code before trusting it.
