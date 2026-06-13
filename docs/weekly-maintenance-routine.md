# Weekly maintenance routine (drafted)

A scheduled Claude Code cloud agent that keeps the repo current with a single,
reviewable PR each week. Drafted from the `BACKLOG.md` "Weekly codemod routine"
item, with extra scope recommended below. **Not yet live** — create it with
`/schedule` once you're happy with the scope.

## Schedule

- **Cron:** `0 9 * * 1` (Mondays, 09:00) — adjust the hour/day and timezone to taste.
- **Frequency rationale:** weekly is often enough to stay current without churning a
  PR every day. Monday morning means the PR is waiting when you start the week.

## Scope

### Core (from the backlog) — the transformative work Dependabot can't do

1. **Next.js codemods** — if `next` is a minor/major behind, bump it and run the
   official codemod (`npx @next/codemod@latest upgrade`), applying relevant transforms.
2. **Biome migration** — if `@biomejs/biome` is behind, bump it and run
   `pnpm biome migrate --write` to update `biome.json` to the new schema.
3. **Verify** with `pnpm check:fast` (lint + typecheck + typegen) before opening the PR.

### Recommended additions (why each earns its place)

4. **Dependabot's blind spots** _(report, or bump if safe)_ — the pnpm version pin
   (`packageManager: pnpm@11.5.3`), Node `.nvmrc` (`26`), and any `overrides` /
   `pnpm-workspace.yaml` overrides. These are exactly what broke CI on 2026-06-11 and
   what Dependabot/this project's current tooling can't bump. **Lockstep rule:** when a
   bumped dependency also appears in an `overrides` block, bump both together.
5. **Migration drift guard** _(report-only)_ — compare the final snapshot/journal across
   `drizzle/migrations/{dev,test,prod}/meta/_journal.json`. Flag if the three don't
   describe the same final schema. This is the exact failure that gave a fresh prod DB an
   obsolete FK and a `23503` seed failure (and it's a standing backlog item).
6. **knip + audit summary** _(report-only, never auto-fix)_ — run `pnpm knip` and
   `pnpm audit`; summarize *new* dead code (vs. what the backlog already tracks) and any
   CVEs in the PR body. Signal without risk.

### Deliberately left out (keep the cron fast & deterministic)

- **Full e2e (`pnpm cy:e2e`)** — slow, and it has the port-reuse trap (silently targets
  any server already on `$PORT`). Verification stops at `check:fast` + `pnpm test:unit`.
- **Coverage thresholds** — still a "consider later" item; too noisy as a weekly gate.
- **Backlog grooming** — fuzzy; that's what the manual `/productivity:update` is for.

## Safeguards (baked into the agent prompt)

- **Release age ≥ 3 days.** Skip anything released in the last ~72h — the pnpm-11
  fresh-release CI breakage (2026-06-11) is the lesson. Brand-new releases wait a week.
- **Never push to `main`, never merge, never run `db:*:prod`.** The agent only opens a PR.
- **No empty PRs.** If there are no code changes *and* no notable report findings, exit
  quietly — don't open a PR just to say "nothing this week."
- **Fail loud, not silent.** If `check:fast` or unit tests can't be made green with a
  minimal fix, open the PR as a **draft** with the failure output captured, so a human decides.
- **Respect project standards.** Read `AGENTS.md`, `CLAUDE.md`, and `BACKLOG.md` first.

## The agent prompt (ready to paste into `/schedule`)

```text
You are the weekly maintenance agent for the nextjs-dashboard repo. Run on a fresh
branch off the latest main: claude/weekly-maintenance-<YYYY-MM-DD>. First read
AGENTS.md, CLAUDE.md, and BACKLOG.md so you respect the project's standards and
known gotchas. Never push to main, never merge, never run any db:*:prod script.

1. RELEASE SCAN — check latest STABLE versions, but ignore any release younger than
   3 days (fresh releases have broken CI here before): next, @biomejs/biome, and
   report-only: pnpm, Node (.nvmrc=26), react/react-dom, drizzle-kit/drizzle-orm,
   vitest, cypress, typescript.

2. CODEMODS (the part Dependabot can't do):
   - If `next` is behind: bump next (and eslint-config-next if present) and run
     `npx @next/codemod@latest upgrade`, applying the relevant transforms.
   - If `@biomejs/biome` is behind: bump it and run `pnpm biome migrate --write`.
   - LOCKSTEP: if any bumped dep also appears in package.json `overrides`/`pnpm.overrides`
     or pnpm-workspace.yaml, bump it there too in the same change.

3. VERIFY: `pnpm install`, then `pnpm check:fast`. If green, also `pnpm test:unit`.
   Do NOT run e2e. If something fails, try a minimal fix; if still red, continue but
   open the PR as a DRAFT with the failing output in the description.

4. REPORT-ONLY (summarize in the PR body; do not change code for these):
   - `pnpm knip` — list NEW unused files/exports not already tracked in BACKLOG.md.
   - `pnpm audit` — list any advisories.
   - MIGRATION DRIFT: compare the latest snapshot + _journal.json across
     drizzle/migrations/{dev,test,prod}. If they don't describe the same final
     schema, flag it prominently.

5. PR: if there are code changes OR notable report findings, open a PR against main
   titled `chore: weekly maintenance <YYYY-MM-DD>` with a body covering what bumped,
   codemods applied, check:fast/unit results, and the report-only findings. If there
   is nothing to change and nothing notable to report, do not open a PR — just stop.
```

## Creating / disabling it

- **Create:** run `/schedule` and paste the prompt above with the cron `0 9 * * 1`.
- **Adjust or stop later:** `/schedule` can list, update, or delete existing routines.

---
_Drafted 2026-06-13. Companion: [`claude-code-command-guide.md`](claude-code-command-guide.md)._
