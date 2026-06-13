# Claude Code command guide

A personal reference for the `/` command palette in the Claude Code input box —
curated for *this* project (solo Next.js dashboard), not the full catalog.

> The desktop "Code" app shows both **built-in commands** (session/control verbs
> that ship with Claude Code) and **skills** (a large plugin catalog plus this
> repo's own `/check`, `/fix`, …). Plugin skills are namespaced: `/productivity:update`,
> `/engineering:architecture`. You invoke them exactly like commands. Most of the
> catalog is noise for a solo project — the dozen below are the ones that earn their keep.

## By cadence (when to reach for each)

| Cadence | When | Commands |
|---|---|---|
| **Per change / pre-PR** ⭐ | before you commit or merge | `/code-review` · `/simplify` · `/security-review` · `/verify` |
| **Session control** | manage the chat itself | `/clear` · `/compact` · `/model` · `/fast` |
| **Periodic upkeep** | weekly · as memory grows | `/productivity:update` · `/fewer-permission-prompts` · `consolidate-memory` |
| **On-demand power** | when the task calls for it | `/schedule` · `/loop` · `/deep-research` · `/run` |
| **Config (terminal-only)** | *not in this app's box* | `/config` · `/permissions` · `/agents` · `/hooks` · `/doctor` |

⭐ = run most often.

## Most important (daily drivers)

The quality loop around every change — fits this project (lots of refactor PRs,
auth code, tests).

| Command | What it does | When |
|---|---|---|
| `/code-review` | Reviews the current diff for **bugs** + cleanups. Effort scales: `low`/`medium` (few, high-confidence) → `high`/`max` (broader) → `ultra` (multi-agent **cloud, billed**). Flags: `--fix` applies findings, `--comment` posts inline on the PR. | before every PR |
| `/simplify` | Applies reuse / simplification / altitude cleanups. **Quality only — does not hunt bugs.** Pairs with refactor work. | after a feature, before review |
| `/security-review` | Security pass over the branch's pending changes. | any auth / DB / session-touching diff |
| `/verify`, `/run` | Launches the app and confirms a change works in-browser (not just green tests). | per feature |

**Key distinction:** `/code-review` finds bugs, `/simplify` improves quality.
Run review → simplify → verify.

## Run periodically

- **`/productivity:update`** — weekly-ish: syncs tasks + refreshes memory.
  `--comprehensive` does a deep activity scan.
- **`consolidate-memory`** (`/anthropic-skills:consolidate-memory`) — when `memory/`
  grows or drifts: merges duplicates, prunes the index. Worth a pass every few weeks.
- **`/schedule`** — for recurring cloud agents. See
  [`weekly-maintenance-routine.md`](weekly-maintenance-routine.md) for the drafted
  weekly codemod/maintenance agent.

## Must-knows

1. **Some commands aren't in this box.** `/config`, `/permissions`, `/agents`,
   `/hooks`, `/doctor` open an interactive *terminal* panel — they do nothing in the
   desktop "Code" app. Use the app's own UI (e.g. the model picker, bottom-right) or
   a `claude` terminal.
2. **`/clear` vs `/compact`** — the biggest lever on cost/quality in long sessions.
   `/clear` wipes context (fresh start, unrelated task); `/compact` summarizes and
   keeps going. Reach for `/clear` when you switch tasks — a bloated context makes
   responses slower and worse.
3. **`/fast`** toggles faster Opus output (no model downgrade) — available on Opus 4.8.
4. **`ultra` is real money.** `/code-review ultra` (deprecated alias: `/ultrareview`)
   spins up a multi-agent cloud review. Worth it before a big merge, overkill for a
   one-liner. It's user-triggered and billed — Claude cannot launch it for you.
5. **Report-only project skills can't touch files.** `/check`, `/lint`, `/test`,
   `/coverage`, `/e2e` carry `disallowed-tools: Edit, Write` — safe to fire anytime;
   they report, Claude acts on the result.
6. **Namespaced domain skills** that fit this project: `/engineering:architecture`
   (you already write ADRs), `/engineering:tech-debt` (knip-triage backlog),
   `/engineering:testing-strategy`, `/deep-research` (the "evaluate reputable-source
   skills" backlog item).

---
_Generated 2026-06-13. Companion: [`weekly-maintenance-routine.md`](weekly-maintenance-routine.md)._
