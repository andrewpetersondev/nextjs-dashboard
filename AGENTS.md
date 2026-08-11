# AI assistant project rules

These instructions apply to AI Assistant, Claude, and ChatGPT when working in this repository.

## Project basics

- Use `pnpm`; do not switch package managers or regenerate the lockfile with another tool.
- This is a Next.js 16 / React 19 / TypeScript app that uses Biome, Vitest, Cypress, Drizzle, and Knip.
- Follow the existing code style and file organization before introducing new patterns.
- Prefer minimal, focused changes and preserve user-authored work.
- If rules conflict with each other or with common practice, stop and ask for clarification.

## Branching

Work flows through a **single-branch, local-first** model: cut a worktree branch from `main`, and merge
it back into `main` **locally** (in the primary checkout) when it is green, then push. There is no
`develop` integration branch; CI runs on the push to `main`. Never commit directly on `main` —
always work from a worktree feature branch. See [`docs/branching-and-releases.md`](docs/branching-and-releases.md).

Human feature work opens **no pull request** — it merges locally. PRs still exist for automation
(Dependabot, the weekly-maintenance routine), which is why `.github/PULL_REQUEST_TEMPLATE.md` is live.
Because a bot PR has no human reviewer, `ci.yml` also runs on `pull_request` — all jobs except the
slow `E2E (Cypress)` one, which stays push-only.

## Planning: BACKLOG.md and GitHub Issues

The two are a **hybrid**, not duplicates, and each has one job:

- [`BACKLOG.md`](BACKLOG.md) is the complete planning record and the file AI sessions read and update.
  It travels into every worktree, so it works offline and needs no network round-trip. Everything goes
  here, including work too small to be worth a reader's attention.
- **GitHub Issues** track only the **narratable units** — the ones a reader would care about. Not every
  backlog line earns an issue, and that asymmetry is deliberate.

Because feature work has no PR, an issue is closed by a **commit trailer**, not a PR body. Put
`Closes #N` on its own line at the end of the commit message; GitHub closes the issue when the commit
reaches `main`. In a bot PR, the reference goes in the PR description as usual.

When an issue closes, reconcile `BACKLOG.md` in the **same** commit — a closed issue and a stale
backlog line is the failure mode this hybrid exists to avoid.

## Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is
outdated — the docs are the source of truth.

A fresh worktree has **no `node_modules`**, so that path won't exist there until you run `pnpm install`. Don't
conclude the docs were removed. Either install, or read them from the primary checkout — worktrees live under
its `.claude/worktrees/`, so `git worktree list` names it in the first row and the docs sit at the same
relative path under it (same pinned version, since both share one checkout of the lockfile).

## Detailed project standards

For detailed architecture, naming, error-handling, and UI rules, also consult the Markdown files in
`docs/standards/` when they are relevant to the files you are changing. Apply each by judgment, based on
the files you are touching.

## Useful commands

- Fast validation: `pnpm check:fast`
- Full validation: `pnpm check` (a true superset of `check:fast`; includes the knip dead-code gate)
- Lint + format, both toolchains (report-only / autofix): `pnpm lint` / `pnpm fix`
- Format check: `pnpm biome:format:check`
- Lint/typegen/typecheck: `pnpm biome:lint`, `pnpm next:typegen`, `pnpm typecheck`
- Markdown lint + format (markdownlint-cli2 + dprint): `pnpm md:check` (verify), `pnpm md:fix` (autofix)
- Unit tests (no DB; runs anywhere): `pnpm test` (alias for `pnpm test:unit`)
- Integration tests (needs the test database): `pnpm test:integration`
- All Vitest tests (unit + integration): `pnpm test:all`
- Coverage (unit lane): `pnpm test:coverage`
- E2E tests: `pnpm cy:e2e`

## Markdown tooling

Markdown is linted by markdownlint-cli2 (`.markdownlint-cli2.jsonc`) and formatted by dprint (`dprint.json`) —
Biome's markdown support is still experimental, so Biome owns JS/TS/JSON/CSS here and Markdown goes to
markdownlint + dprint. Formatting rules (whitespace,
list/table layout, emphasis markers) are disabled in markdownlint and owned by dprint. Use `pnpm md:check` to
verify and `pnpm md:fix` to auto-fix (markdownlint first, dprint last).

## Shell environment

Development happens on macOS with `zsh`. Some GNU/Linux idioms are missing or behave differently — don't assume them:

- `timeout` is not installed. Don't wrap commands in it; to wait on CI, poll `gh run watch` / `gh pr checks` directly.
- bash-only builtins (e.g. `mapfile`) aren't in `zsh`. Avoid them in one-off commands, or they fail silently.
- Don't pipe a command you care about through `tail`/`head` — the pipe reports the _last_ command's exit code and hides
  an upstream failure (a green-looking `head` over a failing test run). Check the raw exit code, or write to a file and read it.
- Prefer targeted single commands over long compound pipelines. Several destructive/compound forms are blocked by
  `.claude/settings.json` and will simply fail, so build them up granularly and confirm before anything destructive.

## Safety and context

- Env-file policy (owner's decision, 2026-08-05): the values in `.env*` files are **not** treated as
  secret from AI tools — reading `.env.development.local` / `.env.test.local` when a task genuinely
  needs it is fine. The two rules that do bind: **never commit an env file or reproduce its values in
  anything that leaves this machine** (commits, docs, issues, artifacts — this repo is public), and
  treat `.env.production.local` as hands-off: it stays read-denied, because leaking live-deployment
  credentials is the one failure that matters.
- Avoid sending generated artifacts, dependency folders, build output, logs, coverage, or database dumps to AI tools.
- Treat `database/`, `drizzle/`, and `devtools/` as project code, not disposable generated output.
- Enforcement differs by tool **on purpose**: `.gitignore` ignores `.env*` by glob (only the tracked
  `.env.example.local` is excepted), so a future `.env.staging.local` is unignorable-by-default;
  `.aiignore` (JetBrains AI Assistant / Junie indexing) hides all `.env*` the same way, since
  third-party upload is exactly what the policy forbids; `.claude/settings.json` read-denies only
  `.env.production.local` and write-denies every env file. The prod read-deny is two entries on
  purpose: `Read(**/…)` only matches inside the session's own project root, so a worktree session
  could otherwise read the **primary checkout's** copy. The second entry uses the `//` absolute-path
  form with a glob — `Read(//**/.env.production.local)` — which matches that file **anywhere on the
  filesystem**, so it needs no machine-specific path and survives the repo being relocated. Don't
  "dedupe" it away, and don't replace it with a hardcoded absolute path (it was one until
  2026-08-05; a hardcoded path guards exactly one copy and silently stops matching after a move).
  Claude Code reads neither ignore file — `.claudeignore` is not a supported mechanism and has been
  removed.
- Know what that backing is worth. The `Read` denials on `.env.production.local` / `*.pem` / `*.key` and the `Write` denials on env files do block those tools. The `Bash` denials do not generalise: they match on the **command-string prefix**, so `Bash(printenv*)` stops `printenv` while `env` walks straight through, and the `pnpm db:reset*` / `pnpm run db:reset*` denies stop those two spellings while invoking the underlying CLI directly (`pnpm tsx devtools/cli/reset.cli.ts`) walks straight through. Nothing stops Bash from reading a secret file outright. Treat the deny list as a guard against slips, not a boundary — the policy above ("never commit or reproduce values") is the actual contract, and it is on you, not the config.
- The **destructive-git** subset is the one exception, and only since 2026-08-11. `.claude/hooks/guard-destructive-git.py` runs as a `PreToolUse` hook on every `Bash` call and matches the whole command string, so the forms that defeat a prefix — `git -C <path> push --force`, `cd x && git reset --hard`, `GIT_DIR=… git branch -D`, `git push origin +main:main` — are refused. It also reads any `bash script.sh` it is asked to run, which is how a `git filter-branch` buried in a script gets caught. Two hard limits: it cannot see through `eval`, an encoded string, or a non-shell program that shells out; and it is an anti-slip guard, not an adversarial boundary. Never route around it — if a destructive git operation is genuinely needed, say so and let Andrew run it from his own terminal.
- That hook must return `permissionDecision: "deny"`. A hook returning `"ask"` is **silently swallowed** by this project's blanket `Bash(*)` allow rule and the command runs with no prompt — verified end-to-end, not inferred. After touching either the hook or the permissions block, re-prove it: `git -C /tmp/no-such-repo-xyz push --force-with-lease origin main` must be refused, not reach git. Config that reads as protection and does nothing is this repo's most-repeated bug.
