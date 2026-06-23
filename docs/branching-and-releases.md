# Branching & releases

> The question this answers: _"Which branch do I work on, how does a change reach
> production, and what CI runs at each step?"_ The visual companion is
> [diagrams/branch-and-ci-flow.md](diagrams/branch-and-ci-flow.md).

## Why this shape

This repo uses a two-tier branch model — `feature → develop → main` — for three
reasons:

1. **Parallel work.** Several Claude sessions (or you, across tasks) can each work
   on their own branch and integrate through `develop` without every merge touching
   production.
2. **A clean production face.** `main` is the portfolio/production branch. Half-done
   work never lands there — it accumulates on `develop` until a deliberate release.
3. **Cheaper feedback.** The slow end-to-end suite and the Vercel production deploy
   happen once per _release_, not on every merge.

## The branches

| Branch           | Role                             | How code lands                                  |
| ---------------- | -------------------------------- | ----------------------------------------------- |
| `feature` / lane | one unit of work, one session    | its own branch → PR into `develop`              |
| `develop`        | **default** branch · integration | only through a PR                               |
| `main`           | production · promote-only        | never directly — only via a `develop → main` PR |

`develop` is the repository's **default branch**, so new clones, new worktrees, and
`gh pr create` all target it automatically.

## Everyday flow — shipping to `develop`

1. Branch off `develop` (a worktree per session is the norm — see the Worktrees
   section in [../CLAUDE.md](../CLAUDE.md)).
2. Make your change.
3. Open a PR into `develop`. The `/ship` command runs this end-to-end and targets
   `develop` automatically now that it's the default branch.
4. The fast **`Lint & type-check`** gate runs (~1 min) — the only required check on
   `develop`. Green → merge.

No end-to-end suite runs here, by design, so lane work stays fast.

## Release flow — promoting `develop → main`

When `develop` is in a coherent state you want live:

1. Open a PR with **base `main`, head `develop`**:
   `gh pr create --base main --head develop`.
2. This PR runs the **full gate**: `Lint & type-check` **and** the slow
   `E2E (Cypress)` suite. Both are required on `main`.
3. Merge → `main` advances → Vercel builds a **production** deploy.

A `/promote` command to script this step is planned; until then it's the manual
`gh pr create --base main` above.

## What runs where

CI is one workflow, [`../.github/workflows/ci.yml`](../.github/workflows/ci.yml),
with two jobs and a per-branch gate:

| Branch    | `Lint & type-check` (fast) | `E2E (Cypress)` (slow) | Vercel            |
| --------- | -------------------------- | ---------------------- | ----------------- |
| `develop` | ✅ required                | ⏭ skipped              | preview URL       |
| `main`    | ✅ required                | ✅ required            | production deploy |

The E2E job is gated in the workflow with
`if: github.base_ref == 'main' || github.ref == 'refs/heads/main'`. It is required
on `main` only — never on `develop`, because a _required_ check that gets skipped
would block the merge.

The required-check policy itself lives in GitHub **rulesets** (`Protect Important
Branches` → `main`; `Protect develop (integration)` → `develop`), not in this repo.
If you rename a CI job, update the ruleset's required-status-check contexts or merges
will silently block.

## Working in parallel (lanes)

The point of `develop` is to let multiple branches integrate cheaply. Two sessions
collide only when they edit the same files, so parallel-safe "lanes" are slices with
disjoint footprints:

- **Parallel-safe:** the feature modules
  `src/modules/{auth,banner,customers,invoices,users}`, docs/diagrams, and isolated
  chores (deps, tsconfig, fonts).
- **Single-thread — never parallel-edit:** the shared kernel `src/shared/**` and
  `src/server/**`. Almost everything imports these, so two sessions touching them
  will conflict.

A fuller lane map is planned as its own doc.

## Keeping this honest

Like every doc here, this is a **snapshot**. If you change the branch model, a CI
trigger, or a ruleset, update this file and
[diagrams/branch-and-ci-flow.md](diagrams/branch-and-ci-flow.md) in the same PR.
