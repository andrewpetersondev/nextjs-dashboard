---
apply: always
---

# AI Rule: README Maintenance (Always On)

Scope

- Applies to root README.md only.
- Treat README as the single source of truth for setup, run, test, env, and scripts.

Trigger Conditions (update README when any occur)

- package.json scripts added/renamed/removed.
- Env vars added/renamed or new env files required.
- Tech stack/tooling/versions change.
- Project structure or key paths move.
- Testing/CI workflows change.
- User-facing commands or entry points change.

Edit Rules

- Commands must be copy-paste runnable; prefer pnpm.
- Show only required env vars; no secrets; use clear placeholders.
- Keep Tech Stack, Requirements, Getting Started, Testing, Useful Scripts, Troubleshooting in sync.
- Validate links and referenced paths exist.
- Keep content brief; move deep detail to docs/ and link.

Date Policy

- Update “Last updated: YYYY-MM-DD” only when content changes.

PR Gate

- Any PR that changes scripts, env, tooling, structure, or tests must update README.
- Reviewer checklist:
    - Commands run locally.
    - Sections reflect current reality.
    - Date updated appropriately.

Automation (recommended)

- CI smoke: install → build → list scripts (pnpm -s run) to detect drift.
- Dead-link check on README.
