---
description: Land the current worktree branch locally — review, reconcile BACKLOG/docs, validate, commit, then hand the local merge into main back to me
allowed-tools: Bash(pnpm check:fast), Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git rev-parse:*), Bash(git log:*), Edit, Write
---

Prepare the current worktree branch to be merged into `main` **locally** — no remote feature branch, no
PR. This repo runs a single-branch, local-first model: you review the finished branch in your primary
checkout (WebStorm) and merge it into `main` yourself, then push. CI runs on that push to `main` as the
safety net. Optional `$ARGUMENTS` is the scope/summary for the commit.

Run these steps in order. If a step's precondition fails, STOP and report — do not push ahead.

1. **Branch safety.** Check `git rev-parse --abbrev-ref HEAD` and `git rev-parse --show-toplevel`. Abort
   if the branch is `main`/`master`, or if the toplevel is the primary checkout rather than a path under
   `.claude/worktrees/`. This command only prepares a worktree feature branch — never commit directly on
   `main`.

2. **Review the diff.** Run `git status` and `git diff` to see exactly what you're about to land, and
   summarize it. Flag any unrelated noise and ask before bundling unrelated changes into one commit.

3. **Reconcile — do this _before_ committing, so it lands in the same commit.** If the change closes a
   `BACKLOG.md` item, mark it done; update `memory/` or `docs/` only if project state actually moved.
   Keep edits small and factual. If nothing needs reconciling, say so and move on — don't invent entries.

4. **Validate (hard gate).** Run `pnpm check:fast` (Biome + Markdown + typecheck + typegen + drift) —
   this also covers the reconcile edits from step 3. If anything fails, STOP, report failures with
   `file:line`, and do not commit. This local gate stands in for pre-merge CI, so it must be green before
   you hand off — it's what keeps the `main` push from going red.

5. **Commit.** Stage the change set (code + reconcile edits), then make one focused commit,
   conventional-commit style. Use `$ARGUMENTS` as the scope/summary when provided. End the message with:

   `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

6. **Hand off the local merge — do NOT merge into `main` yourself.** `main` is checked out in the
   primary checkout (your review gate); a worktree can't and shouldn't merge into it. Report that the
   branch is validated and committed, and give me the exact merge to run in my primary checkout (WebStorm
   "Merge into main", or terminal):

   `git -C <primary-checkout> merge --no-ff <this-branch>` then `git -C <primary-checkout> push origin main`

   Because all worktrees share one object store, that merge is purely local — no fetch, no remote
   round-trip. The push to `main` is what triggers CI and the Vercel production deploy.

7. **Stay safe.** Never delete branches/worktrees, force-push, merge into `main`, or run destructive
   git/DB commands — those are mine to decide, and several are blocked outright by `.claude/settings.json`.
