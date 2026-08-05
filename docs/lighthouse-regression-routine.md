# Lighthouse regression routine

A scheduled Claude Code agent that re-measures the live deployment with Lighthouse once a week and
compares against a recorded baseline. **Live** — it runs as the `lighthouse-regression` scheduled
agent (cron `19 20 * * 0`, Sunday evenings). This doc records its scope and rationale; use
`/schedule` to list, adjust, or disable it.

## Why this exists

Accessibility is continuously guarded — the Cypress suite runs blocking axe checks at
critical+serious+moderate impact. **Performance, SEO, and best-practices have no continuous check at
all.** The only numbers on record came from a single manual run on 2026-08-04, and they are numbers
worth being able to state accurately.

Weekly rather than monthly for now: the deployment changes often enough that a month-old number is
not evidence of anything, and a Sunday-evening run costs one Chrome launch.

## Schedule

- **Cron:** `19 20 * * 0` — Sunday, 20:19 Central. Deeply off-peak, and roughly 90 minutes ahead of
  the [weekly-maintenance](weekly-maintenance-routine.md) run so the two never overlap.
- Sunday evening also means every week's sample is taken under similar low-traffic conditions, which
  makes week-over-week comparison more meaningful than sampling at random hours.

## How it runs

Lighthouse is **deliberately not a project dependency** — it is large, and this routine is its only
consumer. The agent invokes it with `pnpm dlx lighthouse@13`, pinned to the major version, against
both the mobile (default) and desktop presets.

There is no stock Chrome on this machine, so it drives **Google Chrome Dev**:

```bash
export CHROME_PATH="/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev"
```

It reads scores from the JSON output rather than the HTML report, and falls back to locating any
installed Chrome (reporting which binary it used) if that path stops existing.

## Baseline

| Preset  | Perf | A11y | Best-practices | SEO |
| ------- | ---- | ---- | -------------- | --- |
| Mobile  | 100  | 100  | 100            | 100 |
| Desktop | 100  | 100  | 100            | 100 |

Measured 2026-08-05 on Lighthouse 13.4.1. Reference timings — mobile: FCP 1.0s, LCP 1.3s, TBT 10ms,
CLS 0, server-response ~200ms. Desktop: FCP 0.6s, LCP 0.7s, TBT 0ms, CLS 0, server-response ~130ms.

**Known noise:** performance oscillates between roughly 98 and 100 on both presets with no code
change — `force-dynamic` on a free tier means a cold start moves the number. A reading of 98 is not
a regression, and the 5-point threshold below is sized for exactly that.

### The version caveat, which is load-bearing

**Lighthouse scores are only comparable within a version**, and the category set itself changes
between versions — 13.4.1 reports an `agentic-browsing` category that earlier runs did not have, so
a naive diff of "which categories exist" would read as a change to the site.

So the agent always reports the `lighthouseVersion` it used, and when that version differs from one
named in a previous issue comment it says explicitly that part of any delta may be the tool rather
than the site. A regression report without a version stamp is not evidence.

Worth separating from this: the first desktop sample on 13.4.1 read **98** and the second read
**100**, same version, same unchanged code. That gap was run-to-run noise, not a version effect —
which is why the baseline was set from the paired confirming run and why the routine re-runs a
failing preset before escalating.

## Escalation

Escalates only on:

- accessibility, best-practices, or SEO dropping **below 100** on either preset, or
- performance dropping **5 or more points** below baseline on either preset.

Anything smaller is reported as noise. Because Lighthouse is genuinely noisy — and this deployment
is `force-dynamic` on a free tier, so a cold start distorts a single sample — the agent re-runs only
the failing preset once and takes the better of the two before escalating.

On a confirmed regression it comments on the existing open lighthouse issue or opens one, never both,
and closes the issue when scores recover. It never edits code, and a Lighthouse that cannot run at
all is reported as a tooling problem rather than a performance issue.
