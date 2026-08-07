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
   your **pre-push gate**, standing in for pre-merge CI. The `/ship` command does this
   step for you: it reviews the diff, reconciles `BACKLOG.md`/`docs/`, runs the gate,
   commits on the worktree branch, then **stops and hands you step 4** — it will not
   merge into `main` or push.
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
four jobs that all run in parallel on **every push to `main`** and on **every pull request
targeting it** (the PR trigger was added 2026-08-07 for Renovate automerge — see
[`renovate.md`](renovate.md)):

| Job                    | Speed  | What it needs                   | What it catches                                    |
| ---------------------- | ------ | ------------------------------- | -------------------------------------------------- |
| `Lint & type-check`    | fast   | nothing                         | lint, types, migration drift, unit lane + coverage |
| `CSP guard`            | medium | a production build              | un-nonced scripts that would ship a dead page      |
| `Integration (Vitest)` | fast   | Postgres service container      | the DB-backed integration lane                     |
| `E2E (Cypress)`        | slow   | Postgres + a running `next dev` | the app in a real browser, including accessibility |

A push to `main` also triggers the Vercel **production** deploy.

For **human work**, CI runs **after** the push, as a safety net — not as a merge gate (a
direct push can't wait for checks that only start once it lands). The local
`pnpm check:fast` before the merge is what catches most failures early; a red `main` run
means fix-forward.

For **bot PRs** it is the opposite: nobody ran anything locally, so the PR run is the only
verification there is. That is why `ci.yml` gained its `pull_request` trigger — before
2026-08-07 a bot PR saw only `dependency-review.yml`, which runs no build, types, or tests.

`main` is protected by a GitHub ruleset (`Protect Important Branches`) that blocks
force-pushes and branch deletion but **allows** direct pushes — no pull-request rule, by
design.

> [!IMPORTANT]
> That ruleset must also **require the four CI contexts above** for Renovate's automerge to
> be safe: with no required checks, GitHub treats a PR whose checks have not started as
> immediately mergeable. Verify with
> `gh api repos/andrewpetersondev/nextjs-dashboard/rulesets/16781526`; if the only rules are
> `deletion` and `non_fast_forward`, that setting has not been applied yet — see
> [`renovate.md` § Automerge](renovate.md#automerge).

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
