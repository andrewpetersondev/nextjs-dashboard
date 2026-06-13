# Architecture diagrams

A **visual** companion to the prose docs in this folder
([../project-structure.md](../project-structure.md) and
[../shared-architecture.md](../shared-architecture.md)). The prose explains the
rules; these diagrams show the shapes. They exist for a simple reason: no one
can hold a whole system in their head — we draw so we don't have to.

Every diagram here is written in [Mermaid](https://mermaid.js.org) — plain text
that renders as a picture. That keeps each diagram in version control, diffable
in a PR, and sitting right next to the code it describes.

## The diagrams

| File                                                       | The question it answers                                                                   | Diagram type                         |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------ |
| [c4-architecture.md](c4-architecture.md)                   | "How is the whole system carved into pieces?"                                             | C4 (context → container → component) |
| [database-erd.md](database-erd.md)                         | "What tables exist and how do they relate?"                                               | Entity-relationship                  |
| [module-layers.md](module-layers.md)                       | "How is a module layered, and which way do dependencies point?"                           | Layered flowchart                    |
| [auth-login-flow.md](auth-login-flow.md)                   | "Step by step, what happens when someone logs in?"                                        | Sequence                             |
| [request-flow-update-user.md](request-flow-update-user.md) | "How does a form submission travel through the layers?"                                   | Sequence                             |
| [error-handling-flow.md](error-handling-flow.md)           | "How does a failure travel from the database to a red field error — without a `throw`?"   | Sequence + type map                  |
| [route-authorization.md](route-authorization.md)           | "Before a page renders, what decides whether I'm allowed in?"                             | Sequence + decision                  |
| [session-lifecycle.md](session-lifecycle.md)               | "What states can a session be in, and what moves it between them?"                        | State machine                        |
| [dependency-injection.md](dependency-injection.md)         | "How do application contracts and infrastructure implementations actually get connected?" | Component graph                      |

## Pick the question first

The one habit that keeps diagrams from turning into spaghetti: **a diagram should
answer exactly one question.** Decide the question, and the diagram type follows.

| You want to know…                                 | Draw a…                  |
| ------------------------------------------------- | ------------------------ |
| What calls what, in what order (a request, a bug) | **Sequence diagram**     |
| How the system is split into parts                | **C4 / box diagram**     |
| How data changes shape as it moves                | **Data-flow / sequence** |
| What tables exist and how they link               | **ERD**                  |
| What states a thing can be in                     | **State diagram**        |

## The C4 model in one minute

C4 is just four zoom levels. The discipline is **one level per diagram** — mixing
levels is what makes architecture pictures confusing.

1. **Context** — the app as a single box, plus who/what touches it (browser, Neon, Vercel).
2. **Container** — the deployable things: the Next.js app, the Postgres database.
3. **Component** — _inside_ a container: the modules and layers.
4. **Code** — class/function level. Don't hand-draw this; let WebStorm generate it.

See [c4-architecture.md](c4-architecture.md) for levels 1–3 drawn from this repo.

## How to see them render

- **WebStorm / JetBrains** — open any `.md` file here and click the preview pane
  (the split icon, top-right of the editor). Mermaid renders inline. If you see
  raw text instead, enable it under
  **Settings → Languages & Frameworks → Markdown → Mermaid**.
- **GitHub** — renders Mermaid automatically in the file view.
- **VS Code** — install the "Markdown Preview Mermaid Support" extension.

## Keeping them honest

A wrong diagram is worse than no diagram. When you change a flow or a table,
either update the relevant file here, or ask Claude to regenerate it from the
current code (e.g. _"redraw the login sequence from the actual auth module"_).

The first five were generated on **2026-06-03** (branch
`claude/gallant-mccarthy-f13a40`); the last four — error handling, route
authorization, session lifecycle, dependency injection — were added on
**2026-06-04** (branch `claude/tender-shaw-ffdd33`), each verified against the
code at the time (drawing the session diagram even turned up a stale "7 day"
figure in the prose that should have read 15 minutes). Treat them all as a
snapshot — verify against the code before trusting a fine detail.
