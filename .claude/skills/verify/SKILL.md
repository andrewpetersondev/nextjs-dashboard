---
name: verify
description: How to runtime-verify changes in this repo — the surfaces, the handles that work, and the gotchas that cost time. Written after the first /verify run (2026-08-05).
---

# Verifying changes in nextjs-dashboard

## Surfaces by change type

| Change touches                  | Surface                | Handle                                                                                                       |
| ------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| `package.json` scripts, tooling | the scripts themselves | run `pnpm <script>`, observe order/exit; probe removed scripts by name                                       |
| App code (`src/`)               | the running app        | `preview_start` with the `.claude/launch.json` dev config, or `pnpm e2e`                                     |
| `.claude/settings.json` denies  | this live session      | probe with the Read/Bash tool against a matching file; hot-reloads **only outside a worktree** — see gotchas |
| `.gitignore`                    | git                    | `git check-ignore -v <paths>` incl. a hypothetical future path                                               |
| `.claude/commands/*.md`         | the skills palette     | the harness re-reads descriptions live; check the available-skills listing                                   |
| CI / workflows                  | GitHub Actions         | `gh run list --branch main --limit 4` after a push; both CI + CodeQL run                                     |
| Docs only                       | none                   | SKIP — no runtime surface                                                                                    |

## Gotchas (each cost real time once)

- **Exit codes through pipes lie.** `pnpm x | tail; echo $?` reports tail's exit. Capture to a file:
  `pnpm x > "$OUT" 2>&1; echo $?`. (Also stated in `AGENTS.md` §Shell environment.) Re-learned the
  hard way 2026-08-09 on a 15-minute `pnpm cy:e2e` run: piping to `tail -60` reported exit 0 **and**
  discarded the run summary, so the log could neither confirm nor deny that the suite passed. A long
  run is exactly where this costs the most — capture it to a file the first time.
- **Never drive the preview browser by screenshot coordinates.** The screenshot comes back
  downscaled (800×450) while the viewport is 1280×720, but `computer` clicks are applied in
  **viewport** space — so every coordinate read off a screenshot lands ~1.6× short and silently hits
  the wrong element. Call `read_page` and pass `ref: "ref_N"`, or use `form_input`; both are
  resolution-independent. Symptom: clicks and `type` appear to succeed, the form stays empty, and
  `location.href` never changes.
- **A stale preview tab reports `(empty page)` / `Viewport: 0x0`** from `read_page` while
  `screenshot` and `javascript_tool` still work on it — so the tab looks alive and only the
  accessibility bridge is dead, which reads as "the page has no elements". Open a fresh tab
  (`tabs_create` + `navigate`) rather than debugging the page; refs come back immediately. Cost
  several failed login attempts before the control test (JS `document.querySelectorAll('input')`
  returning the real fields) showed the page was fine.
- **Fresh worktrees need `pnpm install`** (fast — shared store, ~6s). Untracked `.env*` files may or
  may not be present; check with `ls` before assuming `pnpm e2e` will fail. `.env.test.local` is
  required for the integration + e2e lanes.
- **Permission `Read(**/…)` denies only match inside the session's project root** — a worktree
  session probing a file in the primary checkout tests the absolute-path entries, not the globs.
  The `//` prefix is the absolute form and it accepts globs: `Read(//**/x)` matches `x` anywhere on
  the filesystem, and it is file-precise (a sibling in the same directory stays readable, despite the
  denial message saying "directory").
- **Permission edits stop hot-reloading after `EnterWorktree`** (observed 2026-08-05). In the primary
  checkout, editing `.claude/settings.json` takes effect within the session — that is how deny rules
  get probed. After entering a worktree, edits to _neither_ the worktree's nor the primary's copy
  took effect, and a rule proven to deny minutes earlier silently stopped denying. **Verify permission
  changes from the primary checkout, then move the edit to the worktree branch to commit.** Config is
  read at session start, so a fresh worktree session loads it correctly — the breakage is a live-session
  artifact, not a config defect. Cost most of a verification pass: three "the pattern doesn't work"
  conclusions that were all the same stale-reload artifact.
- **The Read tool dedupes unchanged files** — "Wasted call — file unchanged since your last Read"
  short-circuits before the permission check, so a second probe of the same path proves nothing.
  Change the content or use a fresh path between probes.
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
- Deny-**reach** probe (does a rule match outside the project root?): write a dummy file with the
  guarded name plus a harmless sibling in a scratchpad subdirectory, then Read both. Denied target +
  readable sibling proves the rule reaches _and_ is file-precise. Never point a reach probe at the
  real `.env.production.local` — if the rule fails to match you have pulled live credentials into
  context. Use a dummy, always. Clean up with `rm -f` (`rm -rf` is denied).
