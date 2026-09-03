# Backlog — nextjs-dashboard

The canonical, cross-session next-steps list for this project. Kept in git so it's
visible in the editor and travels into every worktree. Claude reads and updates this
at the start/end of sessions. (Claude Code has no native cross-session backlog panel —
this file is the deliberate workaround.)

**Kept deliberately small.** Because every session opens this file, it holds `## Open`
plus only the **10 most recent** completed items. Older completed items roll down to
[`docs/backlog-archive.md`](docs/backlog-archive.md), unchanged — moved, never deleted.
Entry-length budget and the rotation rule are in [`AGENTS.md`](AGENTS.md).

**Relationship to GitHub Issues** — a hybrid, not duplicates. This file is the complete
record and works offline; [Issues](https://github.com/andrewpetersondev/nextjs-dashboard/issues)
and the [roadmap board](https://github.com/users/andrewpetersondev/projects/5) carry only
the _narratable_ units, so plenty of lines here have no issue and that is intended. Items
filed as issues link to them below. Since feature work merges locally with no PR, an issue
closes via a `Closes #N` **commit trailer** — and the backlog line is reconciled in that
same commit. Convention in [`AGENTS.md`](AGENTS.md).

## Open

> **Current focus — steady-state maintenance (set 2026-09-03).** The demo-first push that shaped
> this list from 2026-06-25 is **finished**: invoice status lifecycle, demo-surface polish, and the
> a11y pass all shipped and deployed 2026-08-03, and prod Lighthouse confirmed them the day after.
> The Now/Later priority split was retired with it — the items below are the whole open list, in no
> forced order; pick by what is blocking or by appetite. Rationale for the phase that ended is in
> memory (`project_job_hunt_priority_shift`); the work itself is in
> [`docs/backlog-archive.md`](docs/backlog-archive.md) (2026-07-22 → 2026-08-04).
>
> **Before any push:** run the full unit + e2e suites on the merged tree — `check:fast` contains
> no tests.
>
> **Standing decisions — resolved, kept here so they are not re-proposed.** The work and the
> reasoning are in [`docs/backlog-archive.md`](docs/backlog-archive.md); these
> lines exist only to stop a future session re-opening a settled question.
>
> - **Renovate: dropped 2026-08-07, do not re-propose.** Built and validated in full, then reverted
>   — the Mend Renovate GitHub App asks for credit-card details at Marketplace checkout. Dependabot
>   stays.
> - **The `postcss` override stays, and not as a catalog.** `next` still pins `postcss 8.4.31` exact,
>   so dropping the override forks the graph into two copies; the "must equal the devDependency
>   range" warning lives in [`pnpm-workspace.yaml`](pnpm-workspace.yaml) next to the pin. Both
>   tidier-looking alternatives were considered and rejected — pnpm's `"$postcss"` reference is
>   deprecated in pnpm 11, and a catalog would make `package.json` read `"postcss": "catalog:"`,
>   which Dependabot cannot bump.

- [ ] **`next` 16.3.x is HELD — it breaks every Vercel deploy. Added 2026-08-11.** This repo
      sets `output: "standalone"` (for the Docker path, [next.config.ts](next.config.ts)), and on
      16.3.0 that combination fails deployment deterministically with
      `ENOENT … .next/next-server.js.nft.json` thrown from `onBuildComplete`. Upstream
      [vercel/next.js#96646](https://github.com/vercel/next.js/issues/96646) — **open**: Next PR
      #93684 (first stable in 16.3.0) stops emitting `next-server.js.nft.json` when a build
      adapter is active, but the `output: 'standalone'` finalizer's `copyTracedFiles` still reads
      it unguarded; Vercel injects its adapter via `NEXT_ADAPTER_PATH`, so both sides are on.
      Minimal trigger is adapter + standalone — **either alone passes**, which is exactly why
      nothing here caught it: a plain `next build` runs no adapter, so the `csp` job went green on
      the same commit Vercel refused. Verified locally on 16.3.0 (built twice, with and without
      `output: standalone` — both succeeded, both emitted the file). **The takeaway generalises
      past this bug: a green `check` is not a green deploy, and on any `next` bump the Vercel
      check is the only signal for `@vercel/next`-side breakage.** ⚠ **That last clause stopped
      being true when the hold went structural — see the correction at the end of this item.**
      Two workarounds are verified
      upstream and **both deliberately not taken** — `output: process.env.VERCEL ? undefined :
      'standalone'` changes the build path that serves the live demo, and prefixing the Vercel
      build command with `NEXT_ADAPTER_PATH=` is an untracked dashboard setting nothing re-checks.
      **Next step — the condition originally written here is now MET ON ITS FACE AND STILL WRONG;
      read the 2026-08-17 entry at the end of this item before acting.** It said "wait for 16.3.1
      stable, re-read the issue, then bump": 16.3.1 shipped and #96646 is closed, and the hold
      still stands. Lift it only for a stable release that **contains** the fix commit — never for
      one that merely post-dates the issue closing. Full mechanism in memory
      (`project_next163_standalone_vercel_break`).
      **Re-checked and made structural 2026-08-11** (dependency-update lane): upstream #96646 is
      **still open**, last updated 2026-08-07, and there is still no 16.3.1 stable — canaries have
      moved on to `16.3.1-canary.11`. The hold itself was **discipline-dependent until now**: the
      manifest said `"next": "^16.2.12"`, and a caret **admits 16.3.0**, so only the lockfile stood
      between a routine `pnpm update` and a failed deploy. Now pinned **exact** in `package.json`
      with a matching `next: 16.2.12` entry in `pnpm-workspace.yaml` carrying the reasoning, which
      puts it under `pnpm deps:drift` — the gate now reports `2 overlapping package(s) agree
      (postcss, next)`, so the two cannot silently diverge. **Un-pinning is now a deliberate
      two-file edit**, which is the point. Same lesson as the four guards this repo has shipped that
      quietly did nothing: a rule that lives only in prose is not a rule.
      **Correction 2026-08-12 — the Vercel check is now BLIND to a `next` bump, not "the only
      signal".** Verified on Dependabot
      [PR #132](https://github.com/andrewpetersondev/nextjs-dashboard/pull/132) (`next` → 16.3.0):
      Vercel reported **SUCCESS / READY in 44s**, and its build log reads
      `Detected Next.js version: 16.2.12` → `▲ Next.js 16.2.12`. The `pnpm-workspace.yaml` override
      pins the **whole graph including the direct dependency**, so a PR touching only
      `package.json` never installs the new version — the lockfile's `next` resolution does not
      move. **A green Vercel check on such a PR is not evidence 16.3.x deploys; it is evidence
      16.3.x was never built**, so it must not be read as upstream-fixed. The only check that fires
      is `deps:drift`. Re-testing 16.3.x for real therefore needs both files edited — the same
      two-file edit described above, now doing double duty as the only way to get a true signal.
      **Origin:** [PR #131](https://github.com/andrewpetersondev/nextjs-dashboard/pull/131), whose
      Biome half (2.5.6 → 2.5.7) was split off and landed separately; the `next` bump and the two
      `pnpm-workspace.yaml` override-comment rewrites that describe 16.3.0 stayed behind on
      `claude/weekly-maintenance-2026-08-09` and travel together whenever the bump is retaken.
      **HOLD STAYS 2026-08-17 (weekly maintenance) — and the retirement signal this item told you to
      wait for has arrived while being WRONG.** Both halves of the old condition are now true:
      **`next@16.3.1` is stable** (published 2026-08-13T22:48:45Z) and **#96646 is CLOSED**
      (2026-08-14T09:09:04Z). Neither means the bug is fixed. The fix is
      [PR #97287](https://github.com/vercel/next.js/pull/97287) — it re-scopes the #93684 gate so the
      whole-app server NFTs are still emitted when `output: 'standalone'` is set alongside an adapter,
      and guards the `copyTracedFiles` read — and it merged **into `canary`** as `c7b87c23` at
      **2026-08-14T09:09:02Z**, i.e. **~10 hours AFTER 16.3.1 was published**. The issue closed two
      seconds later because that merge auto-closed it. Verified three ways rather than inferred:
      16.3.1's release notes list 20 backports and **#97287 is not among them**; `npm view next
      versions` shows **nothing newer than 16.3.1** on the 16.3.x line (no 16.3.2); and a search for a
      backport PR onto the release branch returns **none**. So the fix is **canary-only** and
      **16.3.1 still contains the deploy-breaking bug**.
      **The generalisable trap — this is the same mistake as the "green Vercel check", one layer out.**
      Twice now the tempting signal has been a _proxy_ for the fix rather than the fix: a green Vercel
      check that never built 16.3.x, and now a closed issue plus a newer stable that predates the
      merge. **A closed upstream issue is not a shipped fix, and a release that post-dates the closure
      is not a release that contains it.** Retirement condition restated so it is directly
      checkable: lift the pin when a **stable `next` release contains commit `c7b87c23`** (check the
      release notes for #97287, or `npm view next@<v>` and confirm the emitted
      `next-server.js.nft.json` guard is present) — then do the two-file edit, and let the **Vercel
      check on a branch where both files moved** be the proof.
      `.github/dependabot.yml`'s `next: ["16.3.x"]` ignore entry stays correct and its stated
      retirement ("once 16.3.1+ ships the fix") still reads right — note it turns on _ships the fix_,
      not on 16.3.1 existing. ⚠ When the fix does land in, say, 16.3.2, that ignore entry **also
      blocks the good version**, so it must be retired in the same edit that lifts the pin.
      **HOLD STAYS 2026-08-24 (weekly maintenance) — re-checked against 16.3.2, still diverged.**
      `next@16.3.2` shipped stable 2026-08-21 (3 days old, past this routine's freshness floor).
      Checked directly rather than inferred from dates: `gh api
      repos/vercel/next.js/compare/c7b87c23...v16.3.2 -q .status` → **"diverged"** — the fix commit
      is not an ancestor of the 16.3.2 tag (same result for v16.3.1). The retirement condition from
      2026-08-17 is unchanged and still not met; `pnpm-workspace.yaml`'s override comment carries
      the same re-verification.

- [ ] **`node:drift`'s `@types/node` axis has a transitive blind spot — found 2026-08-17, NOT fixed.**
      The fifth axis added on 2026-08-12 pins the **declared** `@types/node` range in `package.json` to
      equal the runtime major (24). It cannot see a transitive open range, and there is one:
      **`@types/pg@8.21.0` declares `"@types/node": "*"`**, so pnpm resolves it to **26.2.0**, and
      `@types/pg/index.d.ts` line 1 is `/// <reference types="node" />`. Under pnpm's isolated layout
      `@types/pg` gets its own symlink — verified pointing at `@types+node@26.2.0` — so a second,
      Node-26 typings copy is physically installed and reachable through a **direct devDependency**
      while `node:drift` reports `OK — @types/node ^24.13.3 matches Node 24`. The root
      `node_modules/@types/node` correctly resolves to 24.13.3, and there are two `@types/node`
      package entries in the lockfile (both were already on `main`; this is pre-existing, not new).
      **Scoped honestly: reachability is proven, harm is not.** `pnpm typecheck` (app + Cypress) is
      green, and TypeScript generally collapses duplicate global declarations to one copy, so no
      Node-26-only API is currently being accepted. The concern is that the guard's stated invariant —
      "tsc never sees an API surface production lacks" — is weaker than it reads, which is the same
      shape as [PR #133](https://github.com/andrewpetersondev/nextjs-dashboard/pull/133): typing
      against a superset of the runtime is not a type error, so nothing fails loudly.
      Options if it is worth closing: a `@types/node` entry in `pnpm-workspace.yaml` `overrides` would
      force one 24.x copy graph-wide (and would then be gated by `deps:drift` like `postcss`/`next`),
      or extend `node:drift` to walk resolved `@types/node` copies rather than only the manifest.
      Neither taken — this run is report-only on findings. **Andrew's call.**

- [ ] **CSP follow-ups** ([#126](https://github.com/andrewpetersondev/nextjs-dashboard/issues/126))
      _(added 2026-08-03, from the security-headers lane — full
      reasoning in `src/shared/http/notes/adr/001`)_ — **TTFB on production `/` fully
      MEASURED 2026-08-04: cold 1.69s, warm 0.21–0.37s.** The cold sample the earlier
      pass was missing now exists, so the cost this decision was most exposed on is
      known end to end: an idle deployment costs a first visitor ~1.7s to first byte,
      warm is a quarter-second, and Lighthouse puts `server-response-time` at 40–50ms
      once warm (so the cold number is start-up, not render). Judged acceptable.
      A second-order cost surfaced in the same pass and is recorded in the ADR:
      **`no-store` disables the browser bfcache** (Lighthouse: "Not actionable"),
      so back-navigation loses its instant restore — no fix keeps this CSP.
      **Fluid Compute RESOLVED 2026-08-04: already enabled** — so 1.69s is already the
      Fluid-optimised cold number (bytecode caching + production pre-warming included).
      It is not a remaining lever; ~1.7s is the floor for the `force-dynamic` path and is
      accepted, not pending. Cost checked while confirming: Hobby's allowances (4
      Active-CPU hrs / 360 GB-hrs / 1M invocations, **no on-demand rate**) leave this
      project orders of magnitude clear, so `force-dynamic` carries no billing exposure.
      Still open: **`require-trusted-types-for 'script'`** on a Report-Only header once there is a
      collector and it's validated against Next 16 + React 19; **HSTS `includeSubDomains`**
      must be re-decided before any move to a custom domain (inert on `*.vercel.app`,
      a two-year non-revocable commitment on an apex you own).
      **Third item added 2026-08-09 — production emits standing `style-src` violations.**
      Found while consolidating avatar rendering. Every `next/image` renders an inline
      `style="color:transparent"` (`next@16.2.12`, `dist/shared/lib/get-img-props.js` — merged
      whenever alt text is hidden, with **no dev/prod branch**), and production runs
      `style-src 'self'`; `'unsafe-inline'` is granted **only when `isDev`**, which is exactly why
      it goes unnoticed locally. Verified both halves rather than inferred: the live header was
      fetched, and the Next source read. **Cosmetic** (`color:transparent` only hides alt text
      while loading) and **predates the customers work** — present since the CSP landed
      2026-08-03 on every page with a customer avatar; `/` is clean (zero `<img>`, zero inline
      styles), so only the dashboard is affected. **It matters because of the Trusted Types item
      above:** the moment a collector exists it will receive a violation for every image on every
      dashboard view before it receives anything real. Narrow fix if wanted:
      `style-src-attr 'unsafe-inline'` alongside `style-src 'self'`, which permits the attribute
      form only and leaves `<style>` blocks restricted — trade-off is that it legitimises all
      inline style attributes, and the app's own code uses none (`AvatarMolecule` was moved to
      standard Tailwind classes precisely to avoid adding one). Full analysis in
      [issue #126's comment](https://github.com/andrewpetersondev/nextjs-dashboard/issues/126#issuecomment-5231159398).
- [ ] **Skills exploration** — evaluate reputable-source skills (e.g. Vercel's
      `vercel-react-best-practices`) against `docs/standards/` before adopting.
- [ ] **TSDoc coverage pass — IN PROGRESS, 29 files left (all `src/app`).** Started
      2026-08-09 on `claude/doc-comments-coverage-a3c7fc`. Baseline was **178 of 649** tracked
      `.ts`/`.tsx` files with zero doc blocks; 76 done. **`src/modules`, `src/shared`,
      `src/ui`, `src/shell`, `src/server` and `database` are all at zero**; `devtools` has two
      left that are **deliberately skipped** (`reset.cli.ts`, `seed.cli.ts` — seven-line entry
      points with no exports, nothing to hover). **Calibration is decided and non-obvious — read
      `feedback_doc_comment_style` in memory before continuing:** the target is WebStorm
      **hover** readability, so "summary + contract" (~4–6 lines), **never `@remarks`**, drop
      `@param` when the signature already says it, TSDoc-standard tags only. Scope: the ~117
      non-test files only (existing doc blocks are left alone, even the over-long ones);
      `src/app`'s 29 convention files get comments only where non-obvious — that judgment call
      is the whole of what remains.
      **Surfaced while documenting:** both `fetch-total-{paid,pending}-invoices.dal.ts` have an
      unreachable `=== undefined` check after a `?? 0`, and `readInvoiceByIdAction` rewraps every
      failure as a `database` error including its own validation error. Neither fixed.

- [ ] **Action-guard asymmetry — NOT a vulnerability, verified 2026-08-09.** Nine read actions
      carry no `requireSession` of their own: 3 in customers (`read-filtered-customers`,
      `read-customers`, `read-total-customers-count`) and 6 in invoices (`read-filtered-invoices`,
      `read-invoice-by-id`, `read-invoices-pages`, `read-invoices-summary`, `read-latest-invoices`,
      `read-revenue-by-period`). `users` is fully guarded. **Empirically tested against a local
      production build**, not reasoned about: every `"use server"` export does get a
      client-callable id (all 32 appear in `.next/server/server-reference-manifest.json`), but an
      unauthenticated `Next-Action` POST to `/dashboard/*` is **307'd by the `src/proxy.ts`
      matcher before the action runs**, and the same id POSTed to `/`, `/auth/login` or
      `/auth/signup` returns `{}` because ids resolve only on their registered route. Positive
      control: the identical request **with** a demo session returns 7 customer emails, so the
      block is real and not a malformed request. **Residual concern (defence-in-depth, not
      urgency):** one regex in one file is the only thing protecting those nine, while their
      siblings have a second layer — and ADR-007 / Phase 2 deliberately chose action-level guards.
      Adding `requireSession` to the nine is consistency work; `read-customer-by-id.action.ts`
      shows it is safe to call from a Server Component page. **Andrew's call.**

## Done

Terse log — newest first, and **deliberately short**: the 10 most recent completed
items only. Older entries roll down to
[`docs/backlog-archive.md`](docs/backlog-archive.md), which keeps the same format —
nothing is deleted, just moved out of the file every session opens.

**Entry budget: one paragraph, ~6 lines.** State what changed, the date and branch,
and the one fact a future session would otherwise have to rediscover. Evidence,
verification transcripts, advisory IDs, and the reasoning behind a verdict belong in
the matching `project_*` memory file — that is what it is for, and duplicating it
here is what grew this section past 1,800 lines once already. When an item is worth
more than a paragraph, write the paragraph and name the memory file.

- [x] **`cypress` 15.21.1 → 16.0.0 — a major whose only code change was deleting one config
      key** _(2026-09-03, `claude/pnpm-package-updates-2f591e`)_ — checked against the published
      16.0.0 breaking-change list rather than by upgrading and seeing what broke. Of everything
      removed, **exactly one applied**: `allowCypressEnv`, which 16 deleted along with
      `Cypress.env()` itself. `Cypress.env()`, `cy.exec()`, `cy.end()`, `Cypress.config()` for
      viewport/`blockHosts`, command `overwrite()` on the now-retryable cookie/storage queries,
      and every `experimental*` flag 16 retired are all unused here — the 2026-06-13 secrets
      hardening had already removed the `Cypress.env()` surface for unrelated reasons, which is
      why a major landed as a one-key diff.
      **Deleting `allowCypressEnv: false` is not a loosening.** Under 15 it hard-disabled a
      blanket browser-side accessor; 16 removed that accessor outright and split the config into
      `env` (sensitive, async `cy.env()`, yields only requested keys) and `expose` (public, sync
      `Cypress.expose()`). The framework now enforces what that line asserted, so the reasoning
      moved onto the `env: {}` / `expose: {}` keys instead of being dropped. The four code
      comments and the `cypress/README.md` bullet that described the old model were rewritten in
      the same commit — a stale security rationale is worse than none.
      **The real blocker was not Cypress.** `cypress-axe@1.7.0` is the latest release and still
      declares peer `cypress ^10||…||^15`; it has not widened for 16. Added a
      `peerDependencyRules.allowedVersions` entry — the third such exception — justified by the
      package being a thin `cy.window()` + axe-core injector that touches none of the removed
      APIs, and verified by the three a11y specs that actually use it.
      **Version floors checked, none binding:** Node 20/25 dropped (repo is 24, CI reads
      `.nvmrc`), Next 14 dropped (on 16.2.12), and the Vite 8 minimum applies to component
      testing only — this suite is e2e-only, so the deliberate `vite: ^7.3.5` hold is untouched.
      The changed `cy.type()` `keystrokeDelay` default (10ms → 0) was the suspected risk given
      `use-debounce` on invoice search; it changed nothing.
      Validation: `check:fast` green (Biome **0 diagnostics** / 687 files, markdownlint 0, dprint,
      typegen, typecheck app + Cypress, `node:drift` / `deps:drift` / `db:drift`), `pnpm audit`
      clean, `pnpm why cypress` → **Found 1 version**, and the full Cypress suite **23 specs /
      44 tests / 0 failing / 0 pending, exit 0** on 16.0.0. CI could not have caught any of this:
      the e2e job skips on `pull_request` (`ci.yml`).

- [x] **Two moderate `qs` advisories closed by override, plus `knip` 6.34.0 — the fourth
      stale-lockfile case** _(2026-09-03, `claude/pnpm-package-updates-2f591e`)_ — closes the
      "found, not fixed / Andrew's call" hand-off left by the `fast-uri` entry below.
      GHSA-x5fp-wj9c-mxmx (array-limit bypass) and GHSA-4mjr-xmp4-gh2g (DoS via
      attacker-controlled `isBuffer`), both dev-only via `cypress → @cypress/request → qs`,
      both patched in 6.16.0. Mechanically identical to `fast-uri`/`brace-expansion`/`nanoid`:
      `@cypress/request@4.0.1` already declares `qs: ^6.15.2`, so the caret admitted the fix and
      only the lockfile was behind — one `pnpm-workspace.yaml` line forces re-resolution.
      **`cypress` 16.0.0 would also have fixed it** (it pulls `@cypress/request ^4.0.0`), and was
      deliberately not taken: a major to close a moderate dev advisory is the expensive path when
      the declaring caret already admits the patch. `pnpm audit` now reports **no known
      vulnerabilities**; `deps:drift` moved to "2 overlapping agree; 7 override-only".
      **Nothing else was due.** Every in-range dependency was already at latest except `knip`
      (6.33.0 → 6.34.0, a stale lockfile entry). The three remaining out-of-range majors stay:
      `@types/node` 26 (must track `engines.node: 24.x`), `@cypress/webpack-preprocessor` 8 (the
      `peerDependencyRules` exception for 7 is still load-bearing), and `cypress` 16.
      ⚠ **`cypress` 16 was taken later the same day — see the entry above.** It stayed here only
      because closing a moderate dev advisory did not justify a major; asked for on its own merits,
      it turned out to be a near-no-op migration.
      **`next` hold re-verified against every 16.3.x tag** — `gh api
      repos/vercel/next.js/compare/c7b87c23...v<tag> -q .status` returns `diverged` for v16.3.1,
      v16.3.2, v16.3.3 **and v16.3.4** (latest). The fix is still canary-only; the hold stands.
      **Read `pnpm outdated` carefully in a fresh worktree**: with no `node_modules` every row's
      Current column says `missing (wanted X)`, which is the absence of an install, not a stale
      dependency — the signal is wanted vs latest. Mechanism in memory
      (`project_transitive_dep_advisory_fix`, fourth instance).
      Validation: `check:fast` all green on Node 24 (Biome **0 diagnostics** / 687 files,
      markdownlint 0, dprint clean, typegen, typecheck app + Cypress, `node:drift` / `deps:drift`
      / `db:drift`), knip exit 0, unit **465/465** across 72 files, integration **21/21**, and the
      full **23-spec** Cypress suite **exit 0** — run because `qs` sits inside Cypress's own HTTP
      client and the e2e job skips on `pull_request`, so nothing in CI would have exercised it.

- [x] **`BACKLOG.md` split — `Done` is now a rolling 10, the rest lives in `docs/backlog-archive.md`**
      _(2026-09-03, `claude/backlog-file-size-b7fa48`)_ — the file had reached **2,121 lines / 187 KB**
      and was slowing the IDE; `## Done` was 87% of it. **Count, not volume, was the wrong diagnosis:**
      82 entries is unremarkable, but lines-per-entry ran 5.2 (June) → 31.4 (August), so August alone
      added 1,478 lines. The section's own preamble already said "terse log — full detail lives in the
      `project_*` memory files"; the fix was enforcing that, not inventing a rule. 72 entries moved to
      the archive **byte-for-byte** (verified by diff, with a control), the window is count-based so it
      can't swing with a busy month, and the budget + rotation are stated in `AGENTS.md` and in
      `/ship` step 3 — the place entries are actually written. Live file: **628 lines.**

- [x] **`/clean-worktrees` now proves content containment with `git cherry`, not just reachability**
      _(2026-09-03, `claude/clean-worktrees-8ac075`)_ — the command classified a branch SAFE only when
      `git rev-list --count origin/main..<branch>` was `0`. That is a **reachability** test, correct for
      this repo's local-first merge-commit flow but permanently wrong for Dependabot lanes: their bumps
      are **cherry-picked** onto `main`, so the commit keeps a distinct SHA, stays unreachable, and gets
      re-reported as "possibly unmerged" every single run. Added step 3b — nonzero-count branches now go
      through `git cherry -v origin/main <branch>`, which compares by **patch-id** (the normalized diff)
      so a cherry-pick and its source collapse together; all-`-` output means CONTAINED-BY-CONTENT, any
      `+` means genuinely UNMERGED. Verified on the three real cases from the same session (`ddf887f4`
      → `81520f51`, `014fa6a6` → `8e3838b2`) **with both controls run**, since a check that always
      prints `-` is indistinguishable from a working one. Deliberate design call: a patch-id match does
      **not** promote a branch into the routine delete block — it needs `git branch -D` (`-d` consults
      ancestry and refuses), so step 7 emits a **separate**, labelled `-D` block with an evidence table.
      Keeping them apart preserves the property that step 6's `-d` block is safe to paste unread. Still
      never runs any deletion itself.

- [x] **Four HIGH `fast-uri` advisories closed by raising the override to `^3.1.6`, plus zod /
      dprint / tsx bumps** _(2026-09-03, `deps/fast-uri-and-bumps-2026-09-03`)_ — **the security
      work was not in either bot PR.** #145 (`zod` 4.5.2 → 4.5.4) and #146 (`dprint` 0.56.1 →
      0.57.0, `tsx` 4.23.12 → 4.23.13) are routine version updates carrying only the
      `dependencies`/`javascript` labels; meanwhile **four open HIGH alerts** sat with no branch
      attached: GHSA-f65p-4m7j-42xc, GHSA-jqff-g426-hqxp, GHSA-fph4-wmhf-6fwf and
      GHSA-5jgf-p345-68v8 — SSRF and host-confusion in `fast-uri`, all patched in **3.1.6**, with
      the override pinned at `^3.1.5` and 3.1.5 installed, inside every vulnerable range.
      **Why no PR existed:** `fast-uri` is a transitive governed by a `pnpm-workspace.yaml`
      override, and Dependabot cannot bump that — so these alerts would have stayed open
      indefinitely. This is the failure mode the override comments already warn about, now seen
      from the alert side rather than the audit side. **The caret already admitted the fix**
      (`^3.1.5` permits 3.1.6); the graph sat on 3.1.5 only because the lockfile resolved before
      3.1.6 shipped, so editing the override line is what forces re-resolution — same
      stale-lockfile class as the original `fast-uri` entry and as `brace-expansion`/`nanoid`.
      Verified the fix reaches the graph rather than just the manifest: **zero** `3.1.5` references
      remain in `pnpm-lock.yaml`, `ajv@8.20.0` links to `fast-uri@3.1.6`, every store symlink
      resolves to 3.1.6, and `pnpm audit` no longer lists `fast-uri` at all.
      **dprint 0.57.0 is a formatter MINOR** — the one bump here that could reformat files and turn
      `md:check` red only _after_ merge. Checked before taking it: **0 changes across 82 files**,
      run against the post-merge content rather than the PR's base.
      **Found, not fixed:** with the HIGHs cleared, `pnpm audit` now surfaces **2 moderate `qs`**
      advisories (GHSA-x5fp-wj9c-mxmx, GHSA-4mjr-xmp4-gh2g; `<6.16.0`, patched 6.16.0), dev-only via
      cypress → `@cypress/request` → `qs`. `@cypress/request@4.0.1` declares `qs: ^6.15.2`, which
      already admits 6.16.0 — so it is a one-line override of the same class. **Andrew's call.**

- [x] **`dashboard.cy.ts` a11y flake fixed — the spec now waits for the overview heading**
      _(2026-09-03, `deps/dependabot-2026-09-03`)_ — `core dashboard pages have no axe violations`
      intermittently failed `page-has-heading-one` on `html`. **Diagnosed, not guessed:** the
      failure screenshot showed the overview still painting its Suspense skeleton, the same commit
      passed the very next full-suite run (a fixed dependency set cannot produce a varying result),
      the failing run finished **faster** (~1s) than a passing one (3.0–3.7s) — an assertion
      outrunning the work — and the seed is deterministic (`devtools/seed/seed.random.ts`), which
      excludes data variance. **Cause:** `loginAsDemoAdmin` → `assertOnDashboard` waits only on
      `pathname`, which flips the instant the client-side navigation commits, while
      `(overview)/loading.tsx` is still rendering `DashboardSkeleton` — which has no `<h1>`. Axe ran
      against the fallback. Every other login spec (`home`, `login`, `demo-user`, `access-control`,
      `signup`) was immune only **incidentally**: each asserts on the dashboard heading right after
      logging in, which doubles as a render barrier. This spec was the only one going straight from
      `pathname` to a DOM assertion. **Fix:** one `cy.findByRole("heading", { name:
      ADMIN_DASHBOARD_H1 }).should("be.visible")` before the first `checkA11yStrict()`, matching the
      idiom the other five already use — deliberately **not** a retry, since `retries: 0`
      (`cypress.config.ts`) is the suite's "a flake must fail loudly" choice and is worth keeping.
      Scoped to the first check only: the other five run after `cy.visit()`, and those routes have
      no `loading.tsx`, so their `<h1>` arrives in the first flush. Verified: the spec **8/8** in a
      row (one at 8s — the slow render that previously would have raced) plus the **full suite
      23/23**. Note a finite run count cannot prove an intermittent flake gone; the claim rests on
      the mechanism — the anchor is the exact heading whose absence produced the violation.

- [x] **Dependabot batch — knip 6.33.0, jose 6.2.10 + zod 4.5.2, and the preprocessor 4.2.0 → 5.0.0
      major** _(2026-09-03, `deps/dependabot-2026-09-03`)_ — all three open bot PRs taken together:
      **#143** (`knip` 6.32.3 → 6.33.0), **#142** (`jose` 6.2.9 → 6.2.10, `zod` 4.4.3 → 4.5.2 — the
      jose half is the bump the 2026-08-24 entry saw sitting uncommitted on `main` and did not
      repeat), and **#144** (`@cypress/webpack-batteries-included-preprocessor` 4.2.0 → **5.0.0**).
      Each was `MERGEABLE`/`CLEAN` and 0 commits behind `main`, but they **conflict with each other**
      on `pnpm-lock.yaml`; resolved by regenerating the lock once (`pnpm install --lockfile-only`)
      rather than hand-merging, then proven by a clean `--frozen-lockfile` install. The importers
      diff is exactly three lines — no collateral re-resolution. None of the four packages is under
      a `pnpm-workspace.yaml` override, so the "override shadows the bump" trap does not apply and
      `deps:drift` was never in play; `next` stays pinned at 16.2.12.
      **The substantive finding is a CI blind spot, not a bump.** The `e2e` job is
      `if: github.event_name != 'pull_request'` ([`ci.yml:304`](.github/workflows/ci.yml)) — a sound
      cost trade-off in general, but it means **#144's only real risk surface was the one job that
      never ran**: the preprocessor compiles the specs and is in no production bundle, so lint,
      types, vitest and the CSP build are all structurally incapable of exercising it. It would have
      gone green on the PR and failed only after reaching `main`. Verified by hand instead: the
      **full 23-spec suite run against 5.0.0** before merging.
      **v5's only breaking change is CoffeeScript removal** — established by diffing the published
      4.2.0 and 5.0.0 tarballs, not from release notes: `coffee-loader` + `coffeescript` dropped,
      the `/\.coffee$/` rule and the `.coffee` resolve extension deleted, and **nothing else moved**
      — `getFullWebpackOptions(filePath?, typescript?)` and the `typescript` option that
      `cypress.config.ts` passes are byte-identical. This repo has no `.coffee` files.
      **Peer rule re-checked and kept**: v5 **still** declares peer `@cypress/webpack-preprocessor`
      `^6.0.4`, so the `peerDependencyRules` entry stays; its comment named 4.2.0 and is updated to
      5.0.0 with the finding, satisfying that block's own "re-check on major bumps" instruction.
      **Also noticed, not changed:** `cypress/node/types/cypress-webpack-preprocessor.d.ts` claims
      the package "ships no type definitions" — false for **both** 4.2.0 and 5.0.0, which set
      `"types": "dist/index.d.ts"` and declare `typescript?: string | boolean`. The local
      `declare module` shadows the real types rather than filling a gap. Pre-existing; left alone.
      Validation on the merged tree: `check:fast` green (Biome **0 diagnostics** / 687 files under
      `--error-on-warnings`, markdownlint 0, dprint clean, typecheck app + Cypress, `node:drift` /
      `deps:drift` / `db:drift` all OK), unit **465/465** across 72 files, and the **full e2e suite
      23/23**. One earlier full run flaked on the dashboard a11y spec and passed on re-run — filed
      and fixed separately — see the entry above — not a bump regression.

- [x] **Warnings now fail the lint gate — `biome:lint` runs `--error-on-warnings`**
      _(2026-08-31, `claude/biome-error-on-warnings`)_ — the zero-diagnostic slate was a **standard
      with no enforcement**: `biome check` exits 0 on warnings, so the only thing holding the line
      was a human reading output. That failed exactly as you would expect — the deleted-suppression
      regression reached `main` past a green local `check:fast` and a green CI run. One flag on one
      script closes it, and because `lint`, `check`, `check:fast` and the CI lint job
      ([`ci.yml:100`](.github/workflows/ci.yml)) all call `pnpm biome:lint`, nothing else needed
      wiring — the failure mode where a new guard exists but runs in no CI job does not apply here.
      **Proved by positive control, not by a passing run.** A gate that has never been seen to fail
      is not known to work: on the clean tree `pnpm biome:lint` still exits **0**; re-introducing the
      exact two-warning regression makes it exit **1** where it previously exited 0, and
      `check:fast` then stops at the lint stage instead of running on.
      **Two gaps left open on purpose.** Infos still exit 0 — Biome has no `--error-on-infos`, and
      rules such as `noExcessiveLinesPerFunction` report at info level here, so the printed slate is
      still the only check for those. And the flag is on the npm script, so bare
      `pnpm exec biome check` is unchanged. Both are written down in
      [`docs/biome.md`](docs/biome.md) rather than left to be rediscovered.
      `biome:lint:fix` was deliberately left alone: it exists to apply fixes, and failing it on
      warnings it has just fixed would only make `pnpm fix` noisier.
      Validation: `check:fast` green, unit **465/465**, run in a worktree with a normal
      `pnpm install` — the type-aware rules this gate now enforces are silently inert without one.

- [x] **Restored two ref suppressions — a type-aware rule that silently cannot run reads exactly
      like a rule that passes** _(2026-08-31, `claude/biome-stale-suppressions`)_ — the two
      `noUnnecessaryConditions` suppressions in
      [`session-refresh.tsx`](src/modules/auth/presentation/session/session-refresh.tsx) were
      **never stale**, and deleting them put 2 warnings on `main`. Restored at the same two guards,
      with a justification that no longer names a version. Total suppressions: 75 → **77**.
      **The false premise.** `noUnnecessaryConditions` is **type-aware** — its own message says
      _"The value's type can never be truthy"_ — so it needs a resolvable `node_modules` to type
      `ReturnType<typeof setTimeout>`. The session that deleted them ran in a worktree that had
      **no `node_modules` at all** at that moment, and later only one whose virtual store was
      redirected outside the project root to work around a sandbox restriction. In both states the
      rule cannot run, so it emits nothing — and Biome then reports the still-correct suppression as
      `suppressions/unused`. That warning was read as "2.5.11 fixed the false positive". It had not:
      the bug is still present in **2.5.11**, and the ref genuinely does hold a timer handle
      assigned earlier in the same effect.
      **Proved both directions before believing it**, in a throwaway worktree at `main` with a
      normal `pnpm install`: without the suppressions, the 2 warnings reproduce exactly (`@types/node`
      resolving to `../.pnpm/...` rather than out to `/tmp`); with them restored, Biome reports
      **zero diagnostics**. The broken environment is symmetric and therefore especially misleading —
      it hides the rule _and_ flags its suppression as unused, so each half corroborates the wrong
      conclusion.
      **The rest of the sweep re-validated clean** in that same correct environment — `check:fast`
      fully green, knip clean, unit **465/465** — so only these two were affected. Also worth
      recording: `pnpm biome:lint` and `pnpm check:fast` both exited **0** on the warnings, because
      `biome check` exits 0 with warnings outstanding; the merge did not break the build, it broke
      the zero-diagnostic standard.
      **The durable lesson is about the harness, not Biome.** A linter finding is only as
      trustworthy as the environment that produced it, and type-aware rules fail _silently_ rather
      than loudly when they cannot resolve types. Before acting on a `suppressions/unused` warning
      for a type-aware rule, confirm the rule can actually run: check that `node_modules` resolves
      inside the project. `biome check <single-file>` is likewise not a substitute — it skips the
      project-wide pass and reported this file clean even in a healthy tree.

- [x] **`nanoid` <3.3.18 advisory (GHSA-2v37-7h3g-55p8) closed — the third stale-lockfile override**
      _(2026-08-31, `claude/pnpm-audit-high-severity-5d7949`)_ — the high advisory that the
      2026-08-17 and 2026-08-24 maintenance runs each reported and left open (report-only routine,
      then "Andrew's call") is fixed with the one-line `pnpm-workspace.yaml` override those
      entries predicted: `nanoid: ^3.3.18`. `pnpm audit` goes from **1 high** to **"No known
      vulnerabilities found"**, and the lockfile diff is **five lines** — the `nanoid@3.3.17` →
      `3.3.18` entry plus `postcss`'s edge to it — so the graph keeps **one** nanoid copy instead of
      forking, which is the failure mode an override is most likely to cause.
      **Re-derived rather than trusted from those entries**, since a diagnosis two weeks old is a
      claim, not a fact: `postcss@8.5.26` is still latest and still declares `nanoid: ^3.3.17`,
      which **admits** the patched 3.3.18. So this stays the **droppable stale-lockfile class**
      alongside `fast-uri` and `brace-expansion` — the blocker was only that 3.3.18 published four
      days after 3.3.17 was locked — and not the upstream-pins-low class of `esbuild`/`sharp`. It
      pins `^3.3.18` inside 3.x deliberately: `postcss`'s `^3.3.17` excludes the 4.x/5.x lines, so a
      wider range would fork the graph rather than dedupe it. 3.3.18 published 2026-08-07, three
      weeks clear of pnpm 11's `minimumReleaseAge` floor, so it carries no repeat of the
      <24h-old-package Vercel failure.
      Two details worth keeping. **`nanoid` is on the prod path**, unlike both its siblings —
      `next → postcss → nanoid`, with the cypress webpack chain only adding more paths — which is
      why `pnpm audit` reports it as `"dev": false`; nothing in this repo imports `nanoid`, so the
      size-zero loop was never reachable from our own code, but the "dev-only, therefore low
      urgency" reflex from the last two overrides does not transfer here. And **`deps:drift` does
      not gate this entry**: `nanoid` has no `package.json` counterpart, so it lands in the
      `overrideOnly` bucket with nothing to stay in lockstep with — the drift risk that bit
      `postcss` does not exist for it.
      Validation: every `check:fast` gate green — markdownlint 0, dprint clean, `next typegen` OK,
      typecheck (app + Cypress) green, and `node:drift` / `deps:drift` / `db:drift` all OK, with
      `deps:drift` naming the split this change created: **2 overlapping (`postcss`, `next`) agree,
      6 override-only** now including `nanoid`. Run under `nvm use 24` — the non-interactive shell
      inherits Node 26, which fails `node:drift` for an environment reason and reads as a repo break
      (same gotcha as the 2026-08-17 run).
      **Biome slate was 2, not 0 — but pre-existing and unrelated to this change**, which touches no
      `.tsx`: the Biome **2.5.11** bump in `29a7c981` fixed the ref false positive that the two
      `noUnnecessaryConditions` suppressions in
      [`session-refresh.tsx`](src/modules/auth/presentation/session/session-refresh.tsx) were added
      for on 2026-07-30, so both now warn as `suppressions/unused`. Deleting the two stale comments
      restores the 0 slate; left out of this commit deliberately to keep a security fix free of
      unrelated source edits. **Note the standing rule still held** — the warnings were found by
      listing diagnostics, not by exit code: `biome check` exits **0** with warnings outstanding, so
      `check:fast` walked straight past them.

---

Older completed items — 75 of them, 2026-06-11 through 2026-08-31 — are in
[`docs/backlog-archive.md`](docs/backlog-archive.md).
