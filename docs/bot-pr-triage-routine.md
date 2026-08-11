# Bot-PR triage routine

A scheduled Claude Code agent that reads the open pull-request queue and reports what to do with
each one. **Live** — it runs as the `bot-pr-triage` scheduled agent (cron `41 6 * * 2,5`, Tuesdays
and Fridays). This doc records its scope and rationale; use `/schedule` to list, adjust, or disable
it.

## Why this exists

Under the [single-branch local-first model](branching-and-releases.md), feature work merges into
`main` **locally from a worktree with no PR**. The consequence is easy to miss: the PR queue is
almost entirely bots — Dependabot, plus the [weekly-maintenance](weekly-maintenance-routine.md)
agent's Sunday-night PR — and **nothing in the daily workflow pulls you to it**.

That has already cost real work. PR #105 sat long enough to be overtaken and had to be closed as
superseded by #107. It is not an isolated case: **#113, #114, #116, #117, #119, and #122 were all
closed rather than merged**, mostly because a manual upgrade or a later grouped PR overtook them
while they waited.

The queue does not need automating — it needs _reading_. This routine makes it legible in under a
minute.

## Schedule

- **Cron:** `41 6 * * 2,5` — Tuesday and Friday mornings, outside peak hours.
- **Frequency rationale:** Dependabot is configured `interval: weekly` (Monday) and the
  weekly-maintenance PR lands Sunday night, so **Tuesday** triages a full queue — by which point
  anything blocked on the 24h release-age policy has cleared. **Friday** catches whatever is still
  open before the weekend. Twice a week is enough for a queue that fills once.

## What it classifies

Every open PR lands in exactly one bucket, each with one recommended action:

| Bucket                  | What it means                                                 | Recommended action                 |
| ----------------------- | ------------------------------------------------------------- | ---------------------------------- |
| **Clean**               | Checks green, mergeable, no override needs a matching bump    | Merge                              |
| **Superseded**          | `main` already has that version or newer                      | Close, don't merge                 |
| **Release-age blocked** | pnpm 11 `minimumReleaseAge` rejected a package under ~24h old | Wait, then rebase                  |
| **Needs lockstep**      | The dep also appears in `overrides` / `pnpm-workspace.yaml`   | Bump the override first            |
| **Failing**             | CI red for any other reason                                   | Investigate (log excerpt included) |
| **Conflicted**          | Dirty merge state                                             | Rebase                             |

**"Checks green" now means something.** Until 2026-08-09 the only workflow on `pull_request` was
`dependency-review.yml` — an advisory scan with no build, no types and no tests — so a green bot PR
proved almost nothing and this routine was carrying the whole weight. `ci.yml` now runs on
`pull_request` too (everything except the slow `E2E (Cypress)` job), so a clean PR has really been
linted, type-checked, drift-gated and tested before you look at it.

**Needs lockstep is now enforced, not just advised.** The `Dependency drift` step in the `check` job
fails any PR that bumps a package whose `overrides` entry does not move with it, so this bucket
should now show up as a RED check rather than as a green PR with a caveat. Treat a green PR in this
bucket as a sign the guard has a gap worth reporting.

**Superseded is verified, not guessed** — the agent reads the current version in `package.json` on
`main` and compares it against the PR's target, rather than inferring from titles.

**Release-age is not a defect.** pnpm 11's `minimumReleaseAge` blocking a package published in the
last 24 hours is the supply-chain policy working correctly. The fix is to wait and re-run, never to
bypass it. (This is what PR #36 hit in June.)

### Standing holds it checks regardless of bucket

- **Biome bumps** — 2.5.3 once panicked on 8 form `tsx` files while exiting 0, which is silent lint
  loss. `biome check` exits 0 on warnings, so the printed slate matters more than the exit code.
- **`next` bumps** — bounded on **both** sides. TypeScript 7 requires `next >= 16.2.12`, so anything
  lower is flagged; and **16.3.x is held** because `output: "standalone"` plus Vercel's build adapter
  fails every deployment (upstream `vercel/next.js#96646`, open as of 2026-08-11). Since 2026-08-11
  `next` is therefore pinned **exact** in `package.json` with a matching `pnpm-workspace.yaml`
  override, so it is a lockstep package too — a `next` bump means editing both files, and
  `deps:drift` fails if only one moves. Do not lift the pin without a green **Vercel** check: no job
  in `ci.yml` runs Vercel's adapter, so CI cannot see this class of breakage.
- **`sharp`** — pinned via an override because `next` pins an older version, so a bump needs the
  override reviewed too.

## What it will not do

It **never merges, closes, approves, pushes, or edits anything.** The merge decision is the review
gate and stays with a human. Its single permitted write action is posting one `@dependabot rebase`
comment on a PR whose release-age block has since cleared — a mechanical bot command, capped at one
per PR per run.

It also flags any PR open more than 14 days by name, and leaves human-authored PRs alone rather than
classifying them as bot work.
