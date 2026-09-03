---
description: Prune stale worktrees + merged branches — find [gone]/merged/empty lanes, auto-remove only CLEAN worktrees, never touch this session or main, then hand you a ready-to-run branch-delete block.
allowed-tools: Bash(git fetch:*), Bash(git worktree list:*), Bash(git worktree remove:*), Bash(git branch -vv:*), Bash(git branch --list:*), Bash(git status:*), Bash(git -C:*), Bash(git rev-parse:*), Bash(git rev-list:*), Bash(git merge-base:*), Bash(git log:*), Bash(git cherry:*)
---

Prune stale git worktrees and the branches behind them, safely. This repo runs many parallel Claude Code
sessions under `.claude/worktrees/`, so merged and abandoned lanes pile up. Remove only what is provably
safe; report everything else instead of forcing it.

Two hard rules, no exceptions:

- **Never** pass `--force` to `git worktree remove`. A worktree that refuses to remove has changes — surface
  them, don't clobber them.
- **Never** run `git branch -d` or `git branch -D` yourself. Branch deletion is intentionally denied in
  `.claude/settings.json` (the project's "confirm before delete" guard). Instead, emit the exact delete
  commands in steps 6 and 7 for the user to run in their own terminal.

Run these steps in order.

1. **Establish the off-limits set.** Run `git rev-parse --show-toplevel` (this session's worktree) and
   `git rev-parse --abbrev-ref HEAD`. These are OFF LIMITS and must be skipped everywhere below:
   - this session's worktree and its branch,
   - the primary checkout (the path with no `.claude/worktrees/` segment),
   - `main` / `master`,
   - any `archive/*` branch.

2. **Refresh and inventory.** Run `git fetch origin --quiet`, then `git worktree list` and `git branch -vv`.
   Record which branches show `[... : gone]` (upstream deleted) and which worktree (if any) holds each branch.

3. **Classify every candidate branch** (all branches except the off-limits set). There are three classes;
   run 3a first, and only run 3b on what 3a leaves over.

   **3a — reachability (the strong proof).** A branch is **SAFE** if
   `git rev-list --count origin/main..<branch>` is `0` — it has no commits that aren't already in main.
   This repo's local-first flow merges with real merge commits, so a normally-merged lane always reaches 0.

   **3b — content containment (the weaker proof).** For each branch with a NONZERO count, run:

   ```bash
   git cherry -v origin/main <branch>
   ```

   `git cherry` compares by **patch-id** — the hash of the normalized diff — not by commit SHA, so a
   cherry-picked commit and its source collapse together. Read the leading mark on every line:
   - `-` → an equivalent patch is already upstream in `origin/main`.
   - `+` → genuinely absent from `origin/main`.

   Classify the branch:
   - **CONTAINED-BY-CONTENT** — output is non-empty and **every** line is `-`. Its content already landed;
     only its SHAs differ. This is the normal state of a Dependabot lane, because those bumps are
     re-applied onto `main` rather than merged, so their count stays nonzero forever.
   - **UNMERGED** — **any** line is `+`. Real unshipped work, or a squash-merged lane from the
     pre-2026-06 PR era. Report it; never delete it and never emit a delete command for it.

   Record the matching `origin/main` commit for each `-` line (`git log --oneline` around the same subject)
   so the report can show what it landed as.

4. **Remove clean worktrees.** For each **SAFE** branch (3a only — not CONTAINED-BY-CONTENT) that is
   checked out in a worktree:
   - Run `git -C <worktree-path> status --porcelain`.
   - Empty output → clean → `git worktree remove <worktree-path>`.
   - Any output → DIRTY → skip it. Capture the file list for the report. Do **not** use `--force`.

5. **Leave worktree-held branches' deletes for after removal.** A branch can't be deleted while a worktree
   holds it, so only branches with no (remaining) worktree are eligible for a delete block. A
   CONTAINED-BY-CONTENT branch still held by a worktree is NOT auto-removed in step 4 — put its
   `git worktree remove <path>` line at the top of the step 7 block instead, above the branch delete.

6. **Emit the SAFE branch-delete block.** For every **SAFE** branch that no longer has a worktree, output a
   single fenced ```bash block the user can paste, one `git branch -d <branch>` per line. `-d` should
   succeed for every branch 3a proved contained; if one refuses, re-verify that branch instead of reaching
   for `-D`. Do not run these yourself.

7. **Emit the CONTAINED-BY-CONTENT block — SEPARATELY, never merged into step 6.** These branches need
   `git branch -D`, because `-d` consults ancestry and will refuse them. Keep the two blocks apart: step 6's
   block is safe to paste unread, and mixing an unconditional `-D` into it would destroy that property.

   Show the evidence table first, then the block:

   ```text
   | Branch | Commit | Landed on main as |
   |---|---|---|
   | scratch/dep-check-0903 | ddf887f4 | 81520f51 |
   ```

   Then one fenced ```bash block of `git branch -D <branch>` lines, prefixed by any
   `git worktree remove` lines from step 5. State plainly above it that these are contained by CONTENT,
   not ancestry, so `-d` will refuse and `-D` will not second-guess the analysis. Do not run these yourself.

8. **Report.** A short summary:
   - **Removed** — worktrees you removed (paths) + branches now queued for deletion.
   - **Needs your call — dirty** — worktrees skipped, with the blocking files.
   - **Needs your call — content already landed** — the CONTAINED-BY-CONTENT table from step 7.
   - **Needs your call — possibly unmerged** — UNMERGED branches, including `[gone]` ones. This repo's
     local-first flow has no PRs to check against, and `git cherry` found at least one `+` commit, so
     there is no evidence the work landed — report them, never delete them.

   End with a fresh `git worktree list` so the result is visible.
