---
description: Promote develop → main — open the release PR, run the full gate (check + E2E), watch CI, hand the merge back
allowed-tools: Bash(git fetch:*), Bash(git status:*), Bash(git log:*), Bash(git rev-parse:*), Bash(git rev-list:*), Bash(git diff:*), Bash(gh pr create:*), Bash(gh pr view:*), Bash(gh pr list:*), Bash(gh pr checks:*), Bash(gh run:*)
---

Open (or reuse) the `develop → main` release PR, gate it on the full CI suite, and hand the merge
decision back to me. This is the deliberate production release — it never merges `main` itself.
Complements `/ship` (which PRs feature work into `develop`); `/promote` moves `develop` into production.

Run these in order. If a precondition fails, STOP and report — don't push ahead.

1. **Sync.** `git fetch origin`. Compare against `origin/main` and `origin/develop` so the result is
   accurate regardless of local branch or worktree state.

2. **Anything to release?** Run `git rev-list --left-right --count origin/main...origin/develop`. If
   `develop` is not ahead of `main` (the right-hand count is 0), STOP — there is nothing to promote.
   Otherwise summarize what will ship with `git log --oneline origin/main..origin/develop`, and flag
   any commit that looks unfinished or unintended.

3. **Reuse or open the PR.** Check for an existing open promote PR with
   `gh pr list --base main --head develop --state open`. If one exists, reuse it. Otherwise
   `gh pr create --base main --head develop` with a release title and a body that lists the promoted
   commits and any BACKLOG items they close. End the body with the 🤖 Generated-with footer.

4. **Watch the full gate.** This PR runs BOTH required checks — `Lint & type-check` and the slow
   `E2E (Cypress)` suite (E2E runs here because the base is `main`). Poll `gh pr checks` until they
   settle. Report green/red plainly; if red, surface the failing job's real log — don't pipe it
   through `tail`/`head` (a passing pipe can hide a failing command; see AGENTS.md).

5. **Hand back the merge.** Do NOT merge. Report that the PR is green and ready, and let me run the
   production merge myself. On merge, `main` advances and Vercel builds the production deploy.

6. **Stay safe.** Never force-push, never delete branches, and never merge to `main` automatically —
   those are mine to decide, and several are blocked outright by `.claude/settings.json`.
