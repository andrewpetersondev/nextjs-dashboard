---
description: Prune stale worktrees + merged branches — find [gone]/merged/empty lanes, auto-remove only CLEAN worktrees, never touch this session or main, then hand you a ready-to-run branch-delete block.
allowed-tools: Bash(git fetch:*), Bash(git worktree list:*), Bash(git worktree remove:*), Bash(git branch -vv:*), Bash(git branch --list:*), Bash(git status:*), Bash(git -C:*), Bash(git rev-parse:*), Bash(git rev-list:*), Bash(git merge-base:*), Bash(git log:*), Bash(gh pr list:*)
---

Prune stale git worktrees and the branches behind them, safely. This repo runs many parallel Claude Code
sessions under `.claude/worktrees/`, so merged and abandoned lanes pile up. Remove only what is provably
safe; report everything else instead of forcing it.

Two hard rules, no exceptions:

- **Never** pass `--force` to `git worktree remove`. A worktree that refuses to remove has changes — surface
  them, don't clobber them.
- **Never** run `git branch -d` or `git branch -D` yourself. Branch deletion is intentionally denied in
  `.claude/settings.json` (the project's "confirm before delete" guard). Instead, emit the exact delete
  commands in step 6 for the user to run in their own terminal.

Run these steps in order.

1. **Establish the off-limits set.** Run `git rev-parse --show-toplevel` (this session's worktree) and
   `git rev-parse --abbrev-ref HEAD`. These are OFF LIMITS and must be skipped everywhere below:
   - this session's worktree and its branch,
   - the primary checkout (the path with no `.claude/worktrees/` segment),
   - `main` / `master`,
   - any `archive/*` branch.

2. **Refresh and inventory.** Run `git fetch origin --quiet`, then `git worktree list` and `git branch -vv`.
   Record which branches show `[... : gone]` (upstream deleted) and which worktree (if any) holds each branch.

3. **Classify every candidate branch** (all branches except the off-limits set). A branch is **SAFE** only if
   at least one of these holds:
   - `gh pr list --state merged --head <branch> --json number` returns a merged PR, **or**
   - `git rev-list --count origin/main..<branch>` is `0` (it has no commits that aren't already in main).

   A branch that is `[gone]` but has unmerged commits and **no** merged PR is **NOT safe** — its remote was
   deleted without merging, so it may be abandoned work. List it under "needs your call" and never delete it.

4. **Remove clean worktrees.** For each SAFE branch that is checked out in a worktree:
   - Run `git -C <worktree-path> status --porcelain`.
   - Empty output → clean → `git worktree remove <worktree-path>`.
   - Any output → DIRTY → skip it. Capture the file list for the report. Do **not** use `--force`.

5. **Leave worktree-held branches' deletes for after removal.** A branch can't be deleted while a worktree
   holds it, so only branches with no (remaining) worktree are eligible for the delete block.

6. **Emit the branch-delete block.** For every SAFE branch that no longer has a worktree, output a single
   fenced ```bash block the user can paste, one `git branch -d <branch>` per line. Add a short note: if `-d`
   refuses for a branch you proved merged in step 3 (squash/merge-commit cases), it's safe to re-run that one
   line with `-D`. Do not run these yourself.

7. **Report.** A short summary:
   - **Removed** — worktrees you removed (paths) + branches now queued for deletion.
   - **Needs your call — dirty** — worktrees skipped, with the blocking files.
   - **Needs your call — possibly unmerged** — `[gone]` branches with unmerged work and no merged PR.

   End with a fresh `git worktree list` so the result is visible.
