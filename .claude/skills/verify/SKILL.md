---
name: verify
description: How to runtime-verify changes in this repo — the surfaces, the handles that work, and the gotchas that cost time. Written after the first /verify run (2026-08-05).
---

# Verifying changes in nextjs-dashboard

## Surfaces by change type

| Change touches                  | Surface                | Handle                                                                     |
| ------------------------------- | ---------------------- | -------------------------------------------------------------------------- |
| `package.json` scripts, tooling | the scripts themselves | run `pnpm <script>`, observe order/exit; probe removed scripts by name     |
| App code (`src/`)               | the running app        | `preview_start` with the `.claude/launch.json` dev config, or `pnpm e2e`   |
| `.claude/settings.json` denies  | this live session      | probe with the Read/Bash tool against a matching file; rules hot-reload    |
| `.gitignore`                    | git                    | `git check-ignore -v <paths>` incl. a hypothetical future path             |
| `.claude/commands/*.md`         | the skills palette     | the harness re-reads descriptions live; check the available-skills listing |
| CI / workflows                  | GitHub Actions         | `gh run list --branch main --limit 4` after a push; both CI + CodeQL run   |
| Docs only                       | none                   | SKIP — no runtime surface                                                  |

## Gotchas (each cost real time once)

- **Exit codes through pipes lie.** `pnpm x | tail; echo $?` reports tail's exit. Capture to a file:
  `pnpm x > "$OUT" 2>&1; echo $?`. (Also stated in `AGENTS.md` §Shell environment.)
- **Fresh worktrees need `pnpm install`** (fast — shared store, ~6s). Untracked `.env*` files may or
  may not be present; check with `ls` before assuming `pnpm e2e` will fail. `.env.test.local` is
  required for the integration + e2e lanes.
- **Permission `Read(**/…)` denies only match inside the session's project root** — a worktree
  session probing a file in the primary checkout tests the absolute-path entries, not the globs.
- **Markdown edits:** run `pnpm fix` before `pnpm check:fast` if you touched tables — dprint owns
  table alignment and `md:format:check` fails on hand-aligned pipes.
- **A full `pnpm check` is viable in-worktree** when `.env.test.local` exists: ~5 min, boots its own
  test server, leaves the tree clean.

## Probe patterns that worked

- Unfixable-markdownlint probe: a file with `# H1` then `### H3` (MD001, not autofixable) plus a
  `*   sloppy list` (dprint-fixable) exercises both halves of `md:check`/`md:fix` and the
  no-short-circuit exit logic. Delete the probe file in the same command that creates it.
- Deny-engine probe: Write a dummy `probe.key` in-root (only _Read_ is denied for `*.key`), attempt
  Read → expect denial, then `rm` it via Bash.
