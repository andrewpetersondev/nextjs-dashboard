# Claude project instructions

Follow the shared repository instructions in `AGENTS.md` — Claude Code does not auto-read that file,
so this pointer is load-bearing. For detailed architecture, error-handling, naming, and UI rules,
consult `docs/standards/` by judgment, based on the files you are touching.

## Landing changes (git safety)

- Always work from a worktree feature branch cut from `main` — never commit directly on `main`.
- After completing a backlog item or fix: reconcile `BACKLOG.md`, memory, and docs first, run
  `pnpm check:fast`, then commit it all together on the worktree branch.
- Then STOP and hand the local merge into `main` back to me — the merge in my primary checkout is my
  review gate, and the push (which triggers CI and the Vercel deploy) is mine. Never merge into
  `main`, push, or delete branches/worktrees without explicit per-change approval.

## Worktrees

Sessions run in git worktrees under `.claude/worktrees/`, usually one per Claude Code session, with
the intended direction being branch-per-architecture lanes running in parallel. Work committed there
lives on its own branch and reaches `main` only through the local merge above; all worktrees share
one object store, so that merge needs no fetch or remote round-trip. Reason about branches, env
files, and isolation with that in mind. The full branch/CI model is in
[`docs/branching-and-releases.md`](docs/branching-and-releases.md).

## Slash commands

Project commands are defined in `.claude/commands/` and auto-surfaced with their descriptions — no
list is duplicated here. Prefer them over ad-hoc equivalents: the report-only ones carry
`disallowed-tools` so they structurally cannot write, and `/ship` encodes the hand-off flow above.
