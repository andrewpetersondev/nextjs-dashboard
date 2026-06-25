# Branching & releases

> The question this answers: _"Which branch do I work on, how does a change reach
> production, and what CI runs?"_ The visual companion is
> [diagrams/branch-and-ci-flow.md](diagrams/branch-and-ci-flow.md).

## Why this shape

This repo uses a **single-branch, local-first** model — `feature → main`, merged
locally — for three reasons:

1. **Low friction.** Work lands in `main` with a local merge in your primary checkout
   (WebStorm). No remote feature branches, no PR round-trip, no second integration
   branch to keep in sync.
2. **One source of truth.** The `main` you see in your editor _is_ production. There is
   no `develop` shadow that drifts behind `origin`.
3. **Isolation without ceremony.** Each Claude session still works in its own worktree
   branch so it never touches your files — but because all worktrees share one git
   object store, merging that branch into `main` is purely local.

## The branches

| Branch           | Role                          | How code lands                                   |
| ---------------- | ----------------------------- | ------------------------------------------------ |
| `feature` / lane | one unit of work, one session | its own worktree branch, cut from `main`         |
| `main`           | **default** · production      | a **local** merge of a feature branch, then push |

`main` is the repository's **default branch**, so new clones and new worktrees base on
it automatically.

## Everyday flow — landing to `main`

1. Branch off `main` in a worktree (one per session is the norm — see the Worktrees
   section in [../CLAUDE.md](../CLAUDE.md)).
2. Make your change.
3. Run `pnpm check:fast` (Biome + Markdown + type-check + typegen + drift) — this is
   your **pre-push gate**, standing in for pre-merge CI. The `/ship` command runs
   steps 2–4 end-to-end and stops here, handing you the merge.
4. In your **primary checkout**, merge the worktree branch into `main` and push:

   ```sh
   git -C <primary-checkout> merge --no-ff <feature-branch>
   git -C <primary-checkout> push origin main
   ```

   The merge is local — worktrees share one object store, so there's no fetch and no
   remote round-trip. The **push** to `main` is what triggers CI and the Vercel
   production deploy.

There are no pull requests in this model; review happens when you merge the branch in
WebStorm. If you ever want a showcase PR, open one by hand — nothing here forbids it.

## What runs where

CI is one workflow, [`../.github/workflows/ci.yml`](../.github/workflows/ci.yml), with
two jobs that both run on **every push to `main`**:

| Trigger        | `Lint & type-check` (fast) | `E2E (Cypress)` (slow) | Vercel            |
| -------------- | -------------------------- | ---------------------- | ----------------- |
| push to `main` | ✅                         | ✅                     | production deploy |

CI runs **after** the push, as a safety net — not as a merge gate (a direct push can't
wait for checks that only start once it lands). The local `pnpm check:fast` before the
merge is what catches most failures early; a red `main` run means fix-forward.

`main` is protected by a GitHub ruleset (`Protect Important Branches`) that blocks
force-pushes and branch deletion but **allows** direct pushes — there is no
required-status-check or pull-request rule, by design.

## Working in parallel (lanes)

You can still run several sessions at once — each in its own worktree branch off `main`,
each merged into `main` locally when done. The rule is unchanged: two sessions collide
only when they **edit the same files**, so pick lanes with disjoint edit footprints. See
[lane-map.md](lane-map.md) for the verified module-coupling graph and today's BACKLOG
mapped onto lanes.

## Keeping this honest

Like every doc here, this is a **snapshot**. If you change the branch model, a CI
trigger, or a ruleset, update this file and
[diagrams/branch-and-ci-flow.md](diagrams/branch-and-ci-flow.md) in the same change.
