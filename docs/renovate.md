# Renovate

Renovate keeps dependencies current. It replaced Dependabot version updates on 2026-08-07
([#124](https://github.com/andrewpetersondev/nextjs-dashboard/issues/124)). Config lives in
[`.github/renovate.json5`](../.github/renovate.json5).

## Why the switch

Dependabot handled `package.json` and GitHub Actions, and nothing else. Three things this repo
genuinely needs kept current were outside its reach, so they were edited by hand:

| Thing                                | Why it matters                                                |
| ------------------------------------ | ------------------------------------------------------------- |
| `packageManager` in `package.json`   | The pinned pnpm version **and its `+sha512…` integrity hash** |
| `.nvmrc`                             | The Node version CI and Vercel build against                  |
| `overrides` in `pnpm-workspace.yaml` | Force-resolves security advisories ahead of upstream          |

Renovate reads all three. The last one only became possible recently: pnpm 11 moved overrides out of
`package.json > pnpm.overrides` and into `pnpm-workspace.yaml`, and Renovate now extracts them under
the depType **`pnpm-workspace.overrides`**. That depType is what the lockstep rule below hangs on.

Dependabot also could not group updates the way this repo wants them — every bump arrived as its own
PR, which is how PRs #113, #114, #116, #117, #119 and #122 all ended up closed-not-merged after being
overtaken while they waited.

## What lands in the queue

Renovate runs early Monday (`* 0-6 * * 1`, Central), which keeps
[bot-pr-triage](bot-pr-triage-routine.md)'s Tuesday/Friday cadence correct.

| Group                         | Contents                                      | Commit prefix     |
| ----------------------------- | --------------------------------------------- | ----------------- |
| prod dependencies (non-major) | `dependencies`, `optionalDependencies`        | `chore(deps)`     |
| dev dependencies (non-major)  | `devDependencies`                             | `chore(dev-deps)` |
| github actions                | every workflow action                         | `ci(deps)`        |
| pnpm (packageManager pin)     | the pnpm version + hash                       | `chore(tooling)`  |
| node (.nvmrc)                 | the Node major                                | `chore(tooling)`  |
| pinned overrides (lockstep)   | everything in `pnpm-workspace.yaml` overrides | `chore(deps)`     |

**Majors are never grouped** — they need codemods and review, so each gets its own PR labelled
`needs-decision`. That is the work the [weekly-maintenance routine](weekly-maintenance-routine.md)
exists for; Renovate does the mechanical bump, the routine runs `@next/codemod` and `biome migrate`.

Everything not in an open PR is listed on the **dependency dashboard** issue. That is the queue's
front door, and it is cheaper to read than N open PRs.

## The lockstep rule

Every entry in `pnpm-workspace.yaml` `overrides` exists to pin a package ahead of upstream, and each
carries a comment saying which advisory or hold motivated it. Two ways that can quietly break:

1. **An override drifts from its reason.** Handled by grouping on the
   `pnpm-workspace.overrides` depType, never automerging the group, and labelling it
   `area: security` so the comment gets re-read on every bump.
2. **An override drifts from the package.json copy of the same package.** This was already live when
   Renovate was adopted: `postcss` was `^8.5.25` in `devDependencies` but `^8.5.24` in `overrides`.
   Handled by the `overridePackages` name list, which pulls both copies into one branch.

> [!WARNING]
> The `overridePackages` list in [`.github/renovate.json5`](../.github/renovate.json5) is maintained
> by hand, because Renovate has no way to say "packages that also appear in overrides". **Adding a
> key to `pnpm-workspace.yaml` `overrides` means adding it there too.** A pointer comment sits above
> the `overrides` block; if the two drift, bot-pr-triage's **Needs lockstep** bucket is the net that
> catches it.

## What did not change

Deleting `.github/dependabot.yml` removed Dependabot **version updates** only. Still live:

- **Dependabot security alerts** and the dependency graph — repo settings, not that file.
- [`dependency-review.yml`](../.github/workflows/dependency-review.yml) — still the gate that fails
  a PR introducing a known-vulnerable dependency.
- `osvVulnerabilityAlerts` in the Renovate config adds OSV-sourced advisory detection on top.

Advisory-driven updates skip both the Monday window and the 3-day soak.

## The 3-day soak

`minimumReleaseAge: "3 days"` with `internalChecksFilter: "strict"`. pnpm 11's own
`minimumReleaseAge` refuses packages younger than 24h, which fails the **Vercel build**, not the PR
— so a PR opened too early cannot go green. `strict` holds the update back entirely rather than
opening a pending PR that will be overtaken and closed. This is the 2026-06-11 CI breakage encoded
as policy.

## Automerge

Off everywhere, deliberately. The merge decision is the review gate (see
[`AGENTS.md`](../AGENTS.md)), and `main` accepts direct pushes — so only `check` + `e2e` would stand
between an automerged PR and production. A ready-to-enable rule for the lowest-risk slice
(dev-dependency patches) is commented at the bottom of the config.

## Editing the config

Validate after any change — this catches bad option names and unresolvable presets:

```bash
pnpm dlx --package=renovate renovate-config-validator --strict
```

Run it with **no path argument**. Passing an explicit file path makes the validator check it as a
_global_ (self-hosted) config against a looser schema, and it will report success while repo-level
mistakes go unnoticed.

## Setup

Renovate runs as the **Mend Renovate GitHub App**, installed on the repository — an account-level
action, not something in this repo. Once installed it opens an onboarding PR; the config here means
that PR should have nothing to add.

---

_Written 2026-08-07 when Renovate replaced Dependabot._
