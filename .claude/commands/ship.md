---
description: Ship the current branch — review, reconcile BACKLOG/docs, validate, commit, push, open a PR, watch CI
allowed-tools: Bash(pnpm check:fast), Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git rev-parse:*), Bash(git log:*), Bash(gh pr create:*), Bash(gh pr view:*), Bash(gh pr checks:*), Bash(gh run:*), Edit, Write
---

End-to-end PR loop for this repo. Complements (does not replace) `/check-full`, which only validates, and the generic
`commit-push-pr` skill, which doesn't know this repo's gate, branch safety, or `BACKLOG.md`. Optional `$ARGUMENTS` is the
scope/summary to use for the commit and PR title.

Run these steps in order. If a step's precondition fails, STOP and report — do not push ahead.

1. **Branch safety.** Check `git rev-parse --abbrev-ref HEAD` and `git rev-parse --show-toplevel`. Abort if the branch is
   `main`/`master`/`develop`, or if the toplevel is the primary checkout rather than a path under `.claude/worktrees/`. This
   command only ships from a worktree feature branch — never commit directly to the shared `develop`/`main` branches.

2. **Review the diff.** Run `git status` and `git diff` to see exactly what you're about to ship, and summarize it. Flag
   any unrelated noise and ask before bundling unrelated changes into one PR.

3. **Reconcile — do this _before_ committing, so it lands in the same PR.** If the change closes a `BACKLOG.md` item, mark
   it done; update `memory/` or `docs/` only if project state actually moved. Keep edits small and factual. If nothing
   needs reconciling, say so and move on — don't invent entries. (This step is the reason `/ship` exists; running it the
   first time proved it must come before the commit, not after.)

4. **Validate (hard gate).** Run `pnpm check:fast` (Biome + Markdown + typecheck + typegen + drift) — this now also covers
   the reconcile edits from step 3. If anything fails, STOP, report failures with `file:line`, and do not commit. Don't run
   the unit/e2e suite locally; that's CI's job in step 7 (e2e needs Docker + `.env.test.local`).

5. **Commit.** Stage the change set (code + reconcile edits), then make one focused commit, conventional-commit style. Use
   `$ARGUMENTS` as the scope/summary when provided. End the message with:

   `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

6. **Push & open PR.** `git push -u origin HEAD`, then `gh pr create` (base defaults to `develop`, the repo's default
   branch) with a concise title and a body that summarizes the change and references any backlog item. End the body with
   the 🤖 Generated-with footer. Never force-push.

7. **Watch CI.** Poll `gh pr checks` until the required checks settle. Report green/red plainly. If red, surface the
   failing job's actual log — do not pipe it through `tail`/`head` (a passing pipe can hide a failing command; see
   AGENTS.md). Don't block indefinitely: report status and hand the decision back to me.

8. **Stay safe.** Never delete branches/worktrees, force-push, or run destructive git/DB commands — those require my
   explicit go-ahead, and several are blocked outright by `.claude/settings.json`.
