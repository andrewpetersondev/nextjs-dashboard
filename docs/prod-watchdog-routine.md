# Production watchdog routine

A scheduled Claude Code agent that checks the **live deployment** every morning. **Live** — it runs
as the `prod-watchdog` `/schedule` agent (cron `30 7 * * *`, daily). This doc records its scope and
rationale; use `/schedule` to list, adjust, or disable it.

## Why this exists

Every other guard in this repo is **event-driven off a commit**: `check:fast` locally, and the four
CI jobs (lint/type/unit, CSP, integration, E2E) on push to `main`. All of them prove the _code_.

Nothing observed the _deployed artifact_ afterwards. The failures that gap allows all happen
**without a push**, so no push-triggered check can ever see them:

1. Neon suspends or expires the free-tier database — the build is fine, the site 500s.
2. A Vercel environment variable is rotated, removed, or expires.
3. Seed data is wiped or drifts, so the demo renders empty tables.
4. A rollback or failed deploy leaves an older build serving.
5. The auth path breaks in production only — cookie flags, secret length, clock skew — while every
   local and CI run stays green.

The useful test for whether something belongs in a routine rather than CI is exactly that: **does
the thing it watches change without a push?**

## Schedule

- **Cron:** `30 7 * * *` — daily, before the working day, so a broken demo is known before anyone
  else finds it.
- **Frequency rationale:** the cost of a broken portfolio demo is measured in whoever visits before
  you notice. Daily is the cheapest cadence that bounds that window to a day.
- **Mondays additionally** run the demo-button and CSP checks (see below).

## What it asserts

Implemented by [`devtools/cli/prod-smoke.cli.ts`](../devtools/cli/prod-smoke.cli.ts), run via
`pnpm smoke:prod`:

| Check                                                        | Failure means                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| `/api/health` → 200, `db: "up"`                              | Neon suspended/expired, or a stale connection string                |
| `/` → 200 containing the hero tagline                        | The deployment serves something other than the current landing page |
| `/dashboard` with no session → 307 to login                  | **The dashboard may be publicly readable**                          |
| Seeded USER logs in, dashboard renders with a flight payload | Authentication is broken in production                              |
| Seeded ADMIN logs in, role-gated Users nav present           | Authorization is broken in production                               |

The point of the login checks is that **a site can return 200 on every page while login is
broken** — which is precisely what a read-only pinger would report as healthy.

The unauthenticated-redirect check is the inverse guard, and the more important one: a watchdog that
only proved pages render would pass just as happily if the dashboard were wide open.

### Weekly extras (Mondays)

- `pnpm smoke:prod --demo` — exercises the one-click demo button, the primary path a first-time
  visitor takes. **This writes.** Each run permanently creates one demo user and one
  `demo_user_counters` row, and those users appear on the admin Users page. Weekly keeps that at
  ~52 rows/year; daily would be ~365, on a page that is itself part of the demo.
- `pnpm smoke:prod:csp` — sets `CSP_GUARD_BASE_URL` so the existing CSP guard probes the live
  deployment. The guard always supported this; nothing had ever pointed it at production.

## How it logs in without a browser

A Server Action is not an endpoint you can POST to blind — its id is generated at build time. But
React renders server-action forms for **progressive enhancement**, so the id travels in the markup
as hidden `$ACTION_REF_<n>` / `$ACTION_<n>:0` / `$ACTION_<n>:1` / `$ACTION_KEY` inputs. Replaying
those with the visible fields dispatches the action.

Two consequences worth knowing:

- The watchdog exercises the **same no-JS path** a real visitor with JavaScript disabled takes, so
  a break in progressive enhancement fails this check loudly rather than silently.
- No browser, no Cypress, no Playwright — which is what makes it cheap enough to run daily.

The scraping lives in [`devtools/shared/server-action-form.ts`](../devtools/shared/server-action-form.ts).
It parses HTML with regex deliberately: the markup comes from this repo's own components, and if it
changes shape the guard _should_ break and say so.

## Credentials

The seeded logins are imported from [`devtools/seed/data/seed.users.ts`](../devtools/seed/data/seed.users.ts),
not copied. They are **not secrets** — this is a portfolio demo whose logins are published in the
README on purpose. Importing rather than duplicating means a changed seed password cannot leave the
guard passing against a login nobody can actually perform.

## Failure policy

- **Warnings are not failures.** Responses slower than 4s are reported but exit 0. `force-dynamic`
  (required by the nonce CSP, see `src/shared/http/notes/adr/001`) puts a cold start on the critical
  path, so a slow first byte is expected. Measured baseline: 1.69s cold / 0.21–0.37s warm
  (2026-08-04), 2.39s cold (2026-08-05). Only past 12s does a request count as a failure.
- **One retry before escalating.** The agent re-runs a failing command once after 60s; a cold-start
  blip should not open an issue.
- **One issue, not one per day.** On a confirmed failure the agent comments on the existing open
  watchdog issue if there is one, and opens a new issue only if there isn't. It closes the issue
  when the check goes green again.
- **The agent never writes to the repo** — no edits, no commits, no pushes, no `db:*:prod`. Its only
  side effect is that one GitHub issue.

## Tuning

Both latency thresholds are constants at the top of `prod-smoke.cli.ts` (`LATENCY.warnMs` /
`LATENCY.failMs`). Raise `warnMs` if cold starts make the routine chatty; lower it if you want
earlier notice of a real performance regression.
