# Getting Started

This guide helps you set up, run, and develop the Next.js Dashboard locally.

## Prerequisites

- Node 24 (pinned in [`.nvmrc`](../.nvmrc); CI reads the version from it, and `pnpm node:drift` asserts it matches `package.json` `engines.node`, the `Dockerfile`, and the Node you are actually running)
- pnpm 11 (pinned via the `packageManager` field in [`package.json`](../package.json))
- PostgreSQL (local or remote)

## 1. Install Node and pnpm

Install and select the pinned Node version. Run `nvm use` from the repo root with no argument —
it reads [`.nvmrc`](../.nvmrc), so it stays correct when the pin moves:

```sh
nvm install 24
```

```sh
nvm use
```

Then let **corepack** provide pnpm. Don't install pnpm with `npm i -g pnpm`, Homebrew, or the
`get.pnpm.io` script: `packageManager` pins an exact pnpm build _and its `+sha512` integrity hash_,
and corepack is what fetches that build and verifies it. A hand-installed pnpm is whatever version
you happened to get, free to drift from the pin with nothing checking. Corepack is also what CI
(`pnpm/action-setup`) and the [`Dockerfile`](../Dockerfile) use, so all three agree:

```sh
corepack enable pnpm
```

```sh
pnpm --version
```

That should print the version pinned in `packageManager`. If it does, corepack is wired up.

> **Two gotchas.**
>
> - **Corepack shims are per-Node-install.** They live inside
>   `~/.nvm/versions/node/<version>/bin/`, so `pnpm` will be missing after you install or switch to
>   a new Node — re-run `corepack enable pnpm` each time.
> - **Node 25 and later no longer bundle corepack** (Node 24 still does). If you are ever on 25+,
>   run `npm install -g corepack@latest` first.

Corepack prompts before downloading a package manager. To skip it, add
`export COREPACK_ENABLE_DOWNLOAD_PROMPT=0` to your shell profile.

### Make `.nvmrc` apply automatically (recommended)

`nvm use` is a one-shot: it lasts until you close the shell. nvm's `default` alias decides
every _new_ shell's version, and nothing reads `.nvmrc` unless you ask it to — so it is
entirely possible to develop for weeks on a different Node major than you ship on, with
`.nvmrc` correct the whole time and only CI ever obeying it. That happened here (dev on
26, everything else on 24, 2026-08-07 → 2026-08-09); pnpm printed
`[WARN] Unsupported engine` on every command throughout and it went unnoticed.

Add a `chpwd` hook to `~/.zshrc` — after the block that loads nvm — so entering any
project with an `.nvmrc` switches to it, and leaving returns you to your default:

```sh
autoload -U add-zsh-hook

# Remembers the .nvmrc contents this last acted on, so a cd that cannot have
# changed anything costs nothing.
typeset -g _NVMRC_SEEN=""

load-nvmrc() {
  # Walk up for the nearest .nvmrc in pure zsh. `nvm_find_nvmrc` does the same
  # thing but costs a subshell, and this runs on EVERY directory change.
  local dir=$PWD nvmrc_path=""
  while [[ -n $dir ]]; do
    if [[ -f $dir/.nvmrc ]]; then nvmrc_path=$dir/.nvmrc; break; fi
    dir=${dir%/*}
  done

  # Key the cache on the .nvmrc CONTENTS, not its path: this repo is worked in
  # via many git worktrees that all pin the same major, so moving between them
  # must not re-resolve anything. "" means no .nvmrc anywhere above us, which is
  # itself a state worth remembering.
  local stamp=""
  [[ -n $nvmrc_path ]] && stamp="$(<$nvmrc_path)"
  [[ $stamp == $_NVMRC_SEEN ]] && return
  _NVMRC_SEEN=$stamp

  # Status goes to STDERR, never stdout: `$(zsh -ic '...')` would otherwise get
  # these lines mixed into its captured output.
  if [[ -n $nvmrc_path ]]; then
    local want="$(<$nvmrc_path)" resolved
    resolved="$(nvm version "$want")"
    if [[ $resolved == "N/A" ]]; then
      print -u2 "nvm: $want is not installed — run \`nvm install\` here."
    elif [[ $resolved != "$(nvm version)" ]]; then
      nvm use --silent "$want"
      print -u2 "nvm: using $resolved per ${nvmrc_path}"
    fi
  elif [[ $(nvm version) != $(nvm version default) ]]; then
    nvm use default --silent
    print -u2 "nvm: back to default ($(nvm version))"
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

This is nvm's own README hook with three deliberate changes, each of which was measured or
hit in practice rather than assumed:

- **It does not auto-install a missing version.** Downloading a Node major as a side effect
  of `cd` is too surprising; it tells you to run `nvm install` instead.
- **Status goes to stderr, not stdout.** The upstream version uses `echo`, which corrupts
  any `$(zsh -ic '...')` command substitution by mixing "Now using node ..." into the
  captured output. That broke a JSON parse the day this was written.
- **It caches, and finds `.nvmrc` without forking.** The upstream shape runs
  `$(nvm_find_nvmrc)` plus two `$(nvm version)` calls on _every_ `cd`, which measured
  **~285 ms per directory change** — four `cd`s inside one project cost ~1.14 s. Walking up
  in pure zsh and short-circuiting when the `.nvmrc` contents are unchanged brings the same
  four to **~0.03 s**. One consequence worth knowing: a manual `nvm use 22` inside a project
  now survives `cd`-ing around within it, and is undone by leaving and coming back (or by
  running `load-nvmrc`).

Remember the corepack gotcha above when it switches you to a Node install you have not used
before.

`pnpm node:drift` reports a mismatch between the running major and the pinned one — as a
warning locally (it is a workstation setting, not a repo defect) and as a hard failure in
CI, where the version comes from `.nvmrc` by construction and a mismatch means a workflow
stopped reading it.

## 2. Install Dependencies

```sh
pnpm install
```

## 3. Configure Environment

Copy [`.env.example.local`](../.env.example.local) to one file per environment, then fill in real values:

- `.env.development.local` — `DATABASE_ENV=development`, `DATABASE_URL` ending in `/dev_db`
- `.env.test.local` — `DATABASE_ENV=test`, `DATABASE_URL` ending in `/test_db`
- `.env.production.local` — `DATABASE_ENV=production`, `DATABASE_URL` ending in `/prod_db`

At minimum each file needs a reachable `DATABASE_URL` and a `SESSION_SECRET`; see the example for the full list.

## 4. Prepare the Database

First, stand up PostgreSQL and create the per-environment databases — see [database-setup.md](database-setup.md). If you already have a database, make sure your `DATABASE_URL` points at it.

Then run migrations and seeds for your target environment.

**Development:**

```sh
pnpm db:push:dev
pnpm db:seed:dev
```

**Test:**

```sh
pnpm db:push:test
pnpm db:seed:test
```

**Production:**

```sh
pnpm db:push:prod
CONFIRM_PROD_DB=yes pnpm db:seed:prod
```

Destructive DB tasks (seed/reset) refuse to run against production without the explicit
`CONFIRM_PROD_DB=yes` opt-in.

## 5. Start the App

**Development (Turbopack):**

```sh
pnpm next:dev
```

**Production-like (standalone build):**

```sh
pnpm serve:standalone
```

Or, if already built:

```sh
pnpm next:start:standalone
```

## 6. Running Tests

Unit tests need no database and no `.env.test.local` — they run anywhere, including a
fresh worktree:

```sh
pnpm test
```

The E2E suite needs a migrated and seeded `test_db` (step 4, test environment). The
one-shot form boots its own server and tears it down again, so this is all you need:

```sh
pnpm cy:e2e
```

To watch the specs run instead, use the interactive runner. `serve:test` cleans, builds,
and serves the test environment in one command — don't build first, its own `pnpm clean`
would delete that build — and it keeps running, so the runner goes in a second terminal:

```sh
pnpm serve:test
```

```sh
pnpm cy:e2e:open
```

See [testing.md](testing.md) for the full E2E workflow, including the lighter
`pnpm cy:server` dev-server target and the integration lane.

## Tips

- If you see build anomalies, try `pnpm clean` then `pnpm next:build`.
- Ensure `DATABASE_URL` points to a reachable database and that migrations have run.
- Auth requires `SESSION_SECRET` to be set and consistent across processes.
