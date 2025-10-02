---
apply: manually
---

# README Maintenance Rules

Edit Rules:

- Commands must be copy-paste runnable; prefer pnpm.
- List only required env vars; no secrets; use clear placeholders.
- Keep Tech Stack, Requirements, Getting Started, Testing, Useful Scripts, Troubleshooting in sync.
- Validate links and referenced paths exist.
- Keep content brief; link to docs/ for depth.
- JetBrains: surface runnable commands and key scripts first; keep headings stable.
- Date Policy: Update “Last updated: YYYY-MM-DD” only when README content changes.

PR Gate:

- PRs changing scripts, env, tooling, structure, or tests must update README.
- Reviewer checks: commands run locally; sections reflect reality; date updated.

Automation (recommended):

- CI smoke: install → build → list scripts (pnpm -s run) to detect drift.
- Dead-link check on README.
- Optional: validate env var placeholders across docs and sample envs.
