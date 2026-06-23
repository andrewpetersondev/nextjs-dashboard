---
description: Ship the current branch — validate, commit, push, open a focused PR, then reconcile BACKLOG/memory
allowed-tools: Bash(pnpm check:fast), Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git rev-parse:*), Bash(git log:*), Bash(gh pr create:*), Bash(gh pr view:*), Bash(gh pr checks:*), Bash(gh run:*), Edit, Write
---

End-to-end PR loop for this repo. Complements (does not replace) `/check-full`, which only validates, and the generic
`commit-push-pr` skill, which doesn't know this repo's gate, branch safety, or `BACKLOG.md`. Optional `$ARGUMENTS` is the
scope/summary to use for the commit and PR title.

Run these steps in order. If a step's precondition fails, STOP and report — do not push ahead.

1. **Branch safety.** Check `git rev-parse --abbrev-ref HEAD` and `git rev-parse --show-toplevel`. Abort if the branch is
   `main`/`master`, or if the toplevel is the primary checkout rather than a path under `.claude/worktrees/`. This command
   only ships from a worktree feature branch — never commit to main.

2. **Validate (hard gate).** Run `pnpm check:fast` (Biome + Markdown + typecheck + typegen + drift). If anything fails,
   STOP, report failures with `file:line`, and do not commit. Do not run the unit/e2e suite locally — that's CI's job in
   step 6 (e2e needs Docker + `.env.test.local`).

3. **Review the diff.** Run `git status` and `git diff`. Summarize what actually changed. Stage with `git add -A`, or
   narrower if there's unrelated noise — ask before bundling unrelated changes into one PR.

4. **Commit.** One focused commit, conventional-commit style. Use `$ARGUMENTS` as the scope/summary when provided. End the
   message with:

   `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

5. **Push & open PR.** `git push -u origin HEAD`, then `gh pr create` with a concise title and a body that summarizes the
   change and references the backlog item. End the body with the 🤖 Generated-with footer. Never force-push.

6. **Watch CI.** Poll `gh pr checks` until the required checks settle. Report green/red plainly. If red, surface the
   failing job's actual log — do not pipe it through `tail`/`head` (a passing pipe can hide a failing command; see
   AGENTS.md). Don't block indefinitely: report status and hand the decision back to me.

7. **Reconcile (the step nothing else does).** Mark the shipped item done in `BACKLOG.md`, and update `memory/` or `docs/`
   only if this change moved project state. Keep these edits small and factual.

8. **Stay safe.** Never delete branches/worktrees, force-push, or run destructive git/DB commands — those require my
   explicit go-ahead, and several are blocked outright by `.claude/settings.json`.
