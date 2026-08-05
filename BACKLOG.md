# Backlog — nextjs-dashboard

The canonical, cross-session next-steps list for this project. Kept in git so it's
visible in the editor and travels into every worktree. Claude reads and updates this
at the start/end of sessions. (Claude Code has no native cross-session backlog panel —
this file is the deliberate workaround.)

**Relationship to GitHub Issues** — a hybrid, not duplicates. This file is the complete
record and works offline; [Issues](https://github.com/andrewpetersondev/nextjs-dashboard/issues)
and the [roadmap board](https://github.com/users/andrewpetersondev/projects/5) carry only
the _narratable_ units, so plenty of lines here have no issue and that is intended. Items
filed as issues link to them below. Since feature work merges locally with no PR, an issue
closes via a `Closes #N` **commit trailer** — and the backlog line is reconciled in that
same commit. Convention in [`AGENTS.md`](AGENTS.md).

## Open

> **Priority focus — set 2026-06-25 (active job hunt, ~1–2 week window).** Shifted the
> emphasis from infrastructure/tooling to the **demo surface a hiring manager actually
> experiences in 60 seconds**: kill demo dead-ends → first impression → one memorable
> feature. The infra-polish items still matter but drop to "Later" below. Full rationale
> in memory (`project_job_hunt_priority_shift`). If week 2 runs long, ship the week-1
> polish on its own — a clean demo beats a half-built feature.
>
> **Lane plan — decided 2026-08-03** (from the verified best-practice review, see Done):
> **Lane A (invoice status lifecycle) SHIPPED + deployed** and **Lane B (demo-surface
> polish) SHIPPED + deployed 2026-08-03**; the **a11y pass (item 3, the serial last
> phase) BUILT 2026-08-03** on the `claude/a11y-pass` lane — see Done. With that, the
> demo-first "Now" list is complete, and the **invoice amount-cap mismatch** (the
> last known demo wart) **landed 2026-08-03** — see Done. Next work comes from "Later".
> Before any push: run the full unit + e2e suites on the merged tree (`check:fast`
> contains no tests).

### Now — job-hunt focus (demo-first, ~2 weeks)

1. **Kill the demo dead-ends** — COMPLETE 2026-08-03 (Lane B), see Done.
   - [x] ~~`forgot-password` live stub~~ — done 2026-07-22.
   - [x] ~~Stub/empty module READMEs~~ — done 2026-08-03 (deleted 7 auth leaf stubs,
         wrote 7 real shared-capability READMEs incl. `policies`/`telemetry`).
   - [x] ~~Font experiment + middleware debug card~~ — resolved "drop" 2026-07-30.
   - [x] ~~Template SVG residue in `public/`~~ — deleted 2026-08-03 (zero refs re-verified).
2. **First impression** — COMPLETE 2026-08-03 (Lane B), see Done.
   - [x] ~~Real landing page~~ — done 2026-07-30.
   - [x] ~~Architecture diagrams on README + drift fixes~~ — done 2026-07-30/31.
   - [x] ~~OG/social-preview image~~ — done 2026-08-03 (`src/app/opengraph-image.tsx`,
         statically prerendered; shared HERO_TAGLINE constant; og/twitter meta in root
         layout; e2e smoke). Unfurl confirmed 2026-08-03 via LinkedIn Post Inspector
         (card renders image/title/domain; image ingested to LinkedIn's CDN).
   - [x] ~~Role-guarding demoable from landing~~ — done 2026-08-03 ("or explore as
         admin" quiet link, per-scheme pinned contrast colors, e2e asserts the ADMIN
         dashboard + Users nav link).
   - [x] ~~Brand-mark dedup / CDN logo gone~~ — done 2026-08-03 (AcmeLogo = non-heading
         span with size prop; landing header, sidebar, and auth pages all consume it;
         auth title promoted to h1; dashboard double-H1 fixed; `BRAND_LOGO_SRC` deleted —
         `brand.constants.ts` now holds brand COPY: `BRAND_NAME` + `HERO_TAGLINE`).
3. **a11y pass** — BUILT 2026-08-03 (`claude/a11y-pass` lane), see Done. Landmarks,
   blocking moderate-impact axe coverage, live regions, and the review's loose ends
   (global-error, missing error boundaries, lane-map refresh) all landed to the
   2026-08-02 verified designs, plus the contrast/label fixes the new blocking checks
   surfaced. **Lighthouse pass since run against prod (2026-08-04) — see Done;
   a11y 100 on both presets, so the axe work holds up under a second engine.**

### Later — lower priority during the job hunt (infra/tooling polish)

- [ ] **Renovate adoption** ([#124](https://github.com/andrewpetersondev/nextjs-dashboard/issues/124))
      — for pnpm-version / node-version / `pnpm-workspace.yaml`
      override automation + grouped dep updates (Dependabot can't do those). Replaces
      Dependabot; needs the Mend Renovate GitHub App installed. _(Partially covered as of
      2026-06-13 by the `weekly-maintenance` routine, which reports/bumps the
      pnpm/node/override gap; Renovate would still automate grouped updates.)_
- [ ] **Rootfiles sweep — remaining judgment calls** ([#125](https://github.com/andrewpetersondev/nextjs-dashboard/issues/125))
      _(added 2026-07-30, from the root-file
      audit; **security headers split out and DONE 2026-08-03** — see Done)_ — items that
      need a decision, not mechanics: **Cypress CI retries** (0 today — honest but
      flake-fragile; decide before the suite grows); **five Biome rules off with no
      rationale** (noUndeclaredDependencies, noUnresolvedImports, useImportExtensions,
      noInferrableTypes, useConsistentArrayType — document why or trial-enable one at a
      time); **interactive Cypress paths bypass the PORT guards** (`cy:open` /
      `cy:e2e:run` skip the env-pin + identity preflight that protect `cy:e2e`);
      **knip css hint** (project globs don't follow `.css` imports).
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
- [ ] **Cypress standalone typecheck lane** ([#127](https://github.com/andrewpetersondev/nextjs-dashboard/issues/127))
      _(added 2026-07-30, rootfiles cleanup)_ — the
      `typecheck:cypress` script was removed: TS7 rejects the `baseUrl` option that
      `cypress/tsconfig.json` deliberately keeps for the webpack preprocessor's
      tsconfig-paths, so the script could never pass under TS7 (and was wired into no
      pipeline). Restoring a real tsc pass needs a typecheck-only tsconfig variant
      (paths without baseUrl) or a preprocessor that understands TS7 configs. Until
      then Cypress type errors surface in-editor and at spec webpack-compile time only.
- [ ] **docs/ consolidation** ([#128](https://github.com/andrewpetersondev/nextjs-dashboard/issues/128))
      — reconcile `docs/standards/` overlap with the existing
      `project-structure.md`, `when-to-use-app-error.md`, and `ui-refactor-strategy.md`.
- [ ] **Forms taxonomy flattening** ([#129](https://github.com/andrewpetersondev/nextjs-dashboard/issues/129))
      — the last open piece of the forms/error cleanup
      (the rest of the shrink → lock → decide → reshape roadmap completed 2026-06-13; see
      Done). Unscheduled. Core layering is sound, so don't migrate internals to DTOs.
      Full context in memory (`project_forms_error_refactor`).
- [ ] **Skills exploration** — evaluate reputable-source skills (e.g. Vercel's
      `vercel-react-best-practices`) against `docs/standards/` before adopting.
- [ ] **Integration lane in CI (optional)** ([#130](https://github.com/andrewpetersondev/nextjs-dashboard/issues/130))
      — the e2e job's Postgres-service-container
      pattern (2026-06-23) could also run the integration vitest lane in CI; today only
      the DB-free unit lane runs there. Unscheduled.

## Done

Terse log — newest first. Full detail lives in the `project_*` memory files.

- [x] **Issue/Projects hybrid — Issues adopted alongside BACKLOG.md** _(2026-08-04,
      `claude/next-steps`)_ — the tracking item, taken once its own gate ("only worth it
      after the demo polish lands") was met. Set up as a **hybrid, not a switch**:
      `BACKLOG.md` stays the complete, offline, worktree-travelling planning record that
      sessions drive; Issues carry only the **narratable units**, and that asymmetry is
      deliberate. Filed the seven open "Later" items as [#124–#130] with bodies giving
      problem / desired outcome / constraints-and-prior-art, each linked back from its
      backlog line. Added a label system whose priority axis mirrors this file's own
      Now/Next/Later vocabulary, plus `needs-decision` for work blocked on a judgement
      call rather than effort. Added GitHub **issue forms** (`.github/ISSUE_TEMPLATE/`:
      task, bug, config) — the task form's Definition-of-Done pre-fills the real gates.
      **The original note's mechanism was stale and had to be adapted:** it said "Issues
      that PRs close", written under the retired two-tier model — human feature work has
      no PR now, so issues close via a `Closes #N` **commit trailer** reaching `main`.
      (Bot PRs still exist — Dependabot, weekly-maintenance — so
      `.github/PULL_REQUEST_TEMPLATE.md` is live, not residue.) Convention documented in
      `AGENTS.md`. **Deliberately NOT done:** no retroactive issues for already-shipped
      work — GitHub stamps creation dates, so filing and closing sixteen issues in one
      day reads as staged rather than lived; history accrues honestly from here. Also
      closed two zero-cost signal gaps found en route: the public repo had an **empty
      description** and **no topics** (both now set). **Projects board added the same day**
      once Andrew granted the `project` scope:
      [board #5](https://github.com/users/andrewpetersondev/projects/5) — public, linked to the
      repo (so it appears on the repo's Projects tab), all seven issues in **Todo**, with a
      README stating the board/BACKLOG split and the `Closes #N` commit-trailer rule so the
      convention is discoverable without reading `AGENTS.md`. Board gotchas for next time:
      `gh project` needs `--owner andrewpetersondev`, not `--owner @me`, or `project link`
      rejects the repo as "different owner"; and this `gh` build has no
      `--short-description` flag — set `shortDescription`/`readme` via the
      `updateProjectV2` GraphQL mutation instead.
- [x] **Prod measurement pass — Lighthouse + cold TTFB** _(2026-08-04,
      `claude/next-steps`)_ — closed the two loose ends the demo-first work left
      behind, both measurement, no product code changed. **Lighthouse** (v13 via
      local Chrome Dev, headless, against the live Vercel deployment — the keyless
      PageSpeed Insights API was quota-exhausted, so it ran locally):
      **mobile 98 / 100 / 100 / 100** and **desktop 100 / 100 / 100 / 100**
      (perf / a11y / best-practices / SEO). Mobile FCP 1.1s, LCP 2.3s, TBT 40ms,
      CLS 0; desktop FCP 0.4s, LCP 0.6s, TBT 0, CLS 0. **a11y 100 on both presets
      independently corroborates the axe work** from the a11y lane — a different
      engine, same verdict. Only real perf notes are minor and shared by both
      presets: ~29KB unused JS in one chunk, two render-blocking CSS chunks, a
      legacy-JS transform hint. **Cold TTFB** on `/` finally sampled: **1.69s cold
      vs 0.24–0.37s warm**, which completes the one number ADR-001 said its
      first-impression cost hung on. **New finding:** `no-store` (from the CSP
      lane's `force-dynamic`) also **disables the browser bfcache** — Lighthouse
      flags it on both presets as "Not actionable"; back-navigation loses its
      instant restore and no fix keeps this CSP. Both recorded in
      `src/shared/http/notes/adr/001` Consequences. Not resolved: whether Fluid
      Compute is enabled — a dashboard-only setting, and the Vercel CLI here is
      unauthenticated.
- [x] **Security headers + a strict nonce CSP** _(2026-08-03, `claude/security-headers`)_ —
      first item pulled from "Later" after the demo-first list closed; split out of the
      rootfiles sweep. The repo sent NO security headers at all. Now five static headers
      from `next.config.ts` `headers()` plus a per-request nonce CSP built in `proxy.ts`
      (`script-src 'self' 'nonce-…' 'strict-dynamic'`, `style-src 'self'`,
      `object-src`/`base-uri`/`frame-ancestors` `'none'`, `form-action 'self'`).
      **The load-bearing finding:** a prerendered page cannot carry a per-request nonce,
      and `'strict-dynamic'` makes browsers ignore the `'self'` fallback — so all five
      prerendered documents shipped un-nonced and **never hydrated**, while still looking
      correct in a screenshot (`self.__next_f` is only defined from inside the blocked
      scripts, so no error boundary fires and no hydration warning is emitted). Hence
      `export const dynamic = "force-dynamic"` on the root layout. There was no cheaper
      option: `script-src 'self'` does not authorize inline script, and App Router emits
      inline flight scripts on every page, so "stay static, drop strict-dynamic" is also a
      dead page. **Next's own docs are wrong** that `experimental.sri` lets you keep static
      generation with a strict CSP (integrity attaches only to file-URL scripts) —
      disproved three ways. Decided via a 9-agent workflow (4 grounding lenses + 3
      adversarial + synthesis); Option A unanimous. Two bugs found en route: the proxy
      matcher excluded by file EXTENSION, and Next answers `/nope.js` with an HTML 404, so
      those documents shipped with no CSP (now prefix-only, and the guard probes
      `/nope.js`); and Next's built-in 404 ships inline styles that `style-src 'self'`
      blocks (hence an app-owned `not-found.tsx`). Guarded by
      `devtools/cli/csp-guard.cli.ts` in its own CI job — asserts every `<script>` carries
      the nonce, verified to fail loudly when the protection is removed. Cypress can NEVER
      cover this: it strips the CSP header by default and runs against `next dev`, which
      never prerenders. Landed as three commits (matcher / 404 page / CSP). Full rationale
      + rejected alternatives: `src/shared/http/notes/adr/001`.
- [x] **30-day absolute session ceiling now actually binds** _(2026-08-03,
      `claude/session-ceiling`)_ — the ceiling was dead code: `MAX_ABSOLUTE_SESSION_SEC`
      and the `absolute_limit_exceeded` path existed, but age was measured from the JWT
      `iat`, and `issueRotated()` mints a fresh `iat` every rotation (only `sid`
      survived) — so an actively used session slid forever and the termination branch
      was unreachable. Anchored on a new **`auth_time`** claim (the OIDC standard for
      original authentication time): `issue()` stamps it, `issueRotated()` copies it
      forward verbatim, the domain reads it as `SessionEntity.startedAt`, and
      `isSessionAbsoluteLifetimeExceeded` measures from that instead of `issuedAt`.
      **Second half of the bug, found while testing:** a terminate decision only
      _refused to extend_ — nothing cleared the cookie, so the token kept authenticating
      requests until its own 15-min expiry. The rotate use case now calls
      `cleanupInvalidTokenHelper` on any termination (new `lifecycle_terminated` reason
      + `rotateSessionUseCase` source). **Backward compatible by design:** `auth_time`
      is optional on the wire and `jwtToSessionTokenClaimsDto` falls back to `iat`, so
      live sessions survive the deploy and pin the claim on their next rotation —
      the application DTO keeps it required, so only infrastructure knows about the
      absence. Also added two semantic validations (`auth_time_in_future`,
      `auth_time_after_iat`) — both would understate session age. Tests: 15 unit
      (domain ceiling regression lock pinning `issuedAt` to _now_ so it can only pass
      via `startedAt`; mapper fallback; service issue/rotate/validate) + 3 integration
      (auth_time preserved across rotation, over-age session terminated AND cookie
      deleted, legacy no-auth_time token rotates and pins). Docs reconciled: the
      session-lifecycle diagram's "honest gap" callout replaced with a claim-by-claim
      table of what survives rotation; auth infrastructure README claim lists.
- [x] **Invoice amount-cap vs seed mismatch** _(2026-08-03, `claude/invoice-amount-cap`)_ —
      the last known demo wart: the schema capped amounts at $10k (course residue)
      while seeds generate up to $50k — and, a second door into the same wart, ~5% of
      rows seed at $0 against `.positive()` — so those rows could never save a
      legitimate field edit (the round-tripped amount itself failed validation).
      Fixed schema-side so already-seeded prod rows heal on code deploy alone, no
      data operation: cap raised to $100,000 (2× the $50k seed max) and `.positive()`
      → `.nonnegative()` ($0 approved as a valid amount 2026-08-03), with readable
      error messages per the username-policy `{ error }` idiom. Guards: a seed↔schema
      contract test (`devtools/seed/__tests__/`) locks every seed amount tier inside
      the schema range; schema boundary unit tests; update-form e2e saves a >$10k
      amount (asserting the round-tripped value) and a $0 amount, with the
      invalid-input case moved to negative amounts. Edit-form comment de-staled.
- [x] **a11y pass (serial phase 3)** _(2026-08-03, `claude/a11y-pass`)_ — audited the
      final UI both lanes produced, to the 2026-08-02 verified designs. **(1) Landmarks**
      — the dashboard layout owns the single `<main tabIndex={-1}>` (id hoisted to
      `MAIN_CONTENT_ID` = "main-content", shared with the NEW skip link — first focusable
      element, off-screen until keyboard focus); all 12 nested mains under
      `src/app/dashboard/**` demoted (6 class-bearing → `<div>`, 6 bare → fragments);
      the layout section's "Dashboard Layout" label dropped (plain div); the aside
      demoted to a div — the sidebar `<nav aria-label="Dashboard sidebar">` is the
      landmark. **(2) Live regions** — standardized on always-mounted containers
      (regions must exist before content arrives): `FieldErrorComponentMolecule` now
      `role="status"`, always mounted, consumers render it unconditionally;
      `ErrorMessage` merged into it (also fixed the status radio group's
      `aria-describedby` pointing at a never-rendered id); `FormAlertMolecule` /
      `ServerMessageMolecule` / `DemoForm` carry `role="alert"` on the container;
      explicit `aria-live` dropped everywhere; `server-message-*`/`auth-server-message-*`
      data-cy contracts preserved; `AuthFormFeedback` mounts the empty container at idle.
      **(3) Axe** — ONE shared `cy.checkA11yStrict()` command (critical+serious+moderate,
      blocking, logs violations); `home.cy.ts` + `signup.cy.ts` use it (signup was
      advisory-only via skipFailures); NEW `smoke/dashboard.cy.ts` checks
      overview/invoices/users as demo admin and asserts exactly one `<main>`.
      **(4) What the blocking checks then caught (all fixed):** body/html had NO
      background — the canvas came from `color-scheme` alone, so axe judged dark-scheme
      text against an assumed-white canvas (fix: `bg-bg-primary` on body — the canvas is
      now explicit in both schemes); stat cards jumped h1→h3 (now H2 pinned to the old
      visual size); Lane A's void badge failed AA in dark (1.94:1 → `bg-bg-disabled
      text-text-primary`); the overdue badge was accent-on-accent (3.91:1 → error
      tokens, reads better anyway); `TableHead` muted text failed on the accent table
      panel (→ `text-text-primary`); pagination arrows + `CreateUserLink` (below md)
      were icon-only links with no accessible name (aria-labels added). **(5) Loose
      ends** — `global-error.tsx` gained `<main>` + `lang="en"` (was en-US vs root en);
      new `error.tsx` for `(overview)` and `customers` (errors no longer fall through
      to global-error, losing all landmarks); `docs/lane-map.md` backlog table
      refreshed. Validation: Biome slate 0, unit 338/338, full Cypress 42/42 incl. the
      three blocking axe specs. Not run: Lighthouse (never in the decided sub-items).
- [x] **Demo-surface polish (Lane B)** _(2026-08-03)_ — the rest of the job-hunt Now
      list in one lane, all to the verified designs: **(1) README rework** — deleted the
      7 auth leaf stubs (layer READMEs cover them), wrote 7 real shared-capability
      READMEs from actual file lists (`http`, `primitives`, `routing`, `time`, `forms`
      front-door, plus the previously-missing `policies` and `telemetry`), fixed the
      auth application README `schemas/`→`validators/` drift. **(2) Template SVGs**
      deleted. **(3) OG image** — `src/app/opengraph-image.tsx` (ImageResponse, pinned
      hexes, statically prerendered — verified `○ /opengraph-image` in the build
      manifest and rendered in the browser); hero tagline hoisted to `HERO_TAGLINE`
      shared with the hero; net-new `openGraph` + `twitter.card` root metadata; e2e
      smoke asserts 200 + image/png. **(4) Landing admin link** — quiet underlined
      "or explore as admin" wired to the existing `demoAdminAction`, per-scheme pinned
      sky shades (light AND dark verified in the preview), new e2e clicks it and
      asserts the ADMIN dashboard + role-gated Users nav link. **(5) Brand-mark dedup**
      — AcmeLogo is a non-heading span (size prop) consumed by landing header, sidebar
      (misleading aria-label dropped), and auth pages via PageHeaderMolecule's new logo
      slot (Image/`IMAGE_SIZES` branch deleted); auth titles promoted to the pages' only
      h1; dashboard's double-H1 fixed (verified one h1 in the preview); CDN
      `BRAND_LOGO_SRC` deleted. Bonus finds: `.env.example.local`'s example
      SESSION_SECRET was shorter than the 32-char minimum the JWT service enforces
      (fixed with a comment); split two over-long Cypress describes (a leftover Lane A
      Biome warning — `biome check` exits 0 on warnings, so watch the printed slate,
      not the exit code). Validation: Biome slate 0, unit 338/338, `check:fast` green,
      production build green, landing/auth/dashboard visually verified in both color
      schemes via a worktree dev server.
- [x] **Invoice status lifecycle (Lane A) — SHIPPED + deployed** _(2026-08-03)_ — the
      job-hunt "one memorable feature": `void` added to the pg enum (migrations `0007` in
      all three env sets + Neon prod, applied before the deploy push); `overdue` DERIVED
      at read time (NET-30 `dueDateOf()`; cutoff computed in TS, bound into SQL — one
      source for the rule); transition matrix (pending→paid/void, terminals locked,
      no-op re-submits allowed) enforced twice — service read+check plus the DAL's atomic
      `WHERE status = expectedFrom` (0 rows → conflict via new `DomainConflictMetadata`);
      create schema excludes `void` (transition-only); edit form = transition buttons with
      terminal field-lock; 5-bucket URL filter through ONE shared `buildInvoiceListWhere`
      (rows + page count can't desync); void excluded from customer-facing counts
      (Total-Invoices card, customers `totalInvoices`, Latest panel); seeds ~10% void.
      Unit 338/338, full Cypress green on the merged tree, feature verified live on prod
      post-deploy (overdue filter partitions real data). Landing detour worth
      remembering: `postgres:latest` (18+) breaks `database-setup.md`'s volume mount
      (doc fixed — pin `postgres:17-alpine`, matches CI) and drizzle-kit silently
      swallows DB connection errors (exit 1, no message). Narrative + design rationale:
      `src/modules/invoices/README.md` "Status lifecycle".
- [x] **Backlog best-practice review — solutions decided (multi-agent verified)**
      _(2026-08-02/03)_ — grounded and adversarially verified the 15 draft solution
      designs for the open Now items (13-agent workflow: 6 area grounders + 6 skeptical
      verifiers + a completeness critic): **7 confirmed, 8 adjusted, 0 refuted**; all
      decided designs are baked into the item texts above. Product decisions approved
      2026-08-03: void excluded from customer-facing counts; paid/void lock edit fields
      (transitions only, delete stays); landing-admin abuse surface consciously accepted.
      Lane plan set (A = lifecycle first, B = demo surface parallel, a11y serial after
      merges — see the Now preamble). Sharpest catches: axe's landmark rules are all
      moderate impact (a critical+serious filter guards none of the landmark work);
      conditionally-mounted `role="alert"` elements generally don't announce; the shared
      create/update Zod schema would have made `void` creatable; the duplicated
      list/pages-count DAL WHERE would have silently broken pagination;
      Satori/ImageResponse can't read Tailwind or CSS vars.
- [x] **Architecture-diagram drift fixes (`docs/diagrams/`)** _(2026-07-31)_ — verified and
      fixed the 2026-07-30 audit findings against the code (every fix checked against source
      before writing). Majors: session-lifecycle.md's 30-day absolute-ceiling claim replaced
      with an honest-gap callout (rotation resets `iat`, so the ceiling never binds; the code
      fix was deliberately deferred — see the new Later item); database-erd.md's "branded IDs"
      claim relocated to the domain layer (the schema layer is plain `string` aliases) and the
      Drizzle Studio tip now uses the env-wrapped `db:studio:dev`/`db:studio:test` scripts;
      error-handling-flow.md now shows the real `FormResult` DTO union (not
      `Result<_, AppError>`) with `toDto()` running server-side in `toFormErrResult`;
      dependency-injection.md now shows proxy.ts calling `sessionTokenServiceFactory` directly
      and only `auth` owning a composition root (`users` = small factory, `invoices` = inline
      construction). Minors: route-authorization.md public row gained
      `/auth/forgot-password`; auth-login-flow.md ADR list gained 007; branch-and-ci-flow.md
      no longer claims `check:fast` runs the unit lane; module-layers.md gained the
      presentation→composition-root edge and scoped "application never imports infrastructure"
      to auth; request-flow-update-user.md renamed the repo to `UserRepositoryImpl` and added
      the `requireAdmin` + `readUserById` hops; c4-architecture.md's table list gained
      `demo_user_counters`.
- [x] **README "Architecture" section (diagrams surfaced)** _(2026-07-30)_ — new section
      between Tech Stack and Project Structure: a fresh, coarse Mermaid overview (request
      path browser → proxy.ts → App Router → 5 modules → shared kernel → PostgreSQL;
      directory names + audit-verified facts only, no styling so both GitHub themes
      render it) plus a curated 5-row table linking only audit-clean diagrams, and the
      gallery link. Chosen over embedding existing diagrams verbatim (two-copies drift)
      and over link-only (wastes GitHub's native mermaid). Preceded by a full 11-agent
      drift audit of docs/diagrams/ — 7 clean, 4 flagged (filed as the follow-up item
      under Now #2; session-lifecycle's false 30-day-ceiling claim is the sharp one).
      The audit also disproved a repo-wide "application never imports infrastructure"
      claim (true for auth only — invoices/users app services import infra
      mappers/codecs), so the README wording scopes it to auth.

- [x] **Demo dead-ends round 2 (interview-impact review, tier 1)** _(2026-07-30)_ — walked
      the 60-second recruiter path (landing → Try the demo → dashboard → invoices → login,
      desktop + mobile, both schemes) and killed the three worst dead-ends it surfaced:
      **(1) middleware debug card deleted** — the raw `User Id: <uuid> in experiment font`
      block was the first thing on the dashboard after the landing CTA; with it went the
      font experiment (resolved "drop": `doto`/`merienda` exports and `--font-experiment`
      var deleted, `H6` commented out like H4/H5 — its only user was the card).
      **(2) "Heads up" meta-banner repurposed** — now a portfolio-demo notice ("seeded demo
      data — explore freely" + GitHub source link), moved from the root layout (every page,
      incl. landing, where it ate the top quarter of a phone screen) into the dashboard
      layout only; cookie bumped `banner_dismissed_v1` → `_v2` so prior dismissals don't
      hide the new copy; dismiss action now revalidates the dashboard layout, not `/`.
      **(3) dead OAuth buttons removed** — login/signup rendered `continue with
      google/github` linking to `/api/auth/{google,github}`, which 404 (no such routes);
      deleted `auth-form-social-section`, `social-login-button`, `icons.tsx`,
      `AUTH_ENDPOINTS`/`OauthProvider`; divider reworded "or continue with" → "or use a
      demo account". New `src/shared/routing/external-urls.ts` owns `GITHUB_REPO_URL`
      (landing + banner). Auth-presentation + banner READMEs reconciled. Tier-2 findings
      from the same review filed under Now/Later above. — cleared the whole `biome check` slate
      (8 warnings + 2 infos → 0): hoisted the prod-db guard-test regexes to module scope,
      exports-last reorder in `prod-db.guard.ts`, split `home.cy.ts` into two describes,
      dropped `?.` on the constructor-assigned `AppError.metadata` in `logging.client.ts`,
      and **deleted the unreachable invoice input guards** (`createInvoice`'s `!dto`, repo
      `create`'s `!input` — resolves the deferred "6 noUnnecessaryConditions" decision;
      `update()` keeps its documented suppressed guard). The `session-refresh.tsx` ref pair
      (known Biome 2.5.6 false positives) is suppressed in-code with reasoned
      `biome-ignore` comments — delete them when a Biome bump reports them unused.
- [x] **AI-config refactor — trust the built-ins** _(2026-07-30)_ — evaluated `.claude/`,
      the ignore files, and the instruction files against current Claude Code built-ins
      (verified against docs + changelog, v2.1.220). Deleted `.claudeignore` (no tool ever
      read it; Claude Code enforcement lives in `settings.json`); slimmed `.aiignore` to
      paths that exist (it is JetBrains-only, and now says so). `settings.json`: fixed the
      env-contract bug (broad `Read(**/.env.*)` also blocked the tracked
      `.env.example.local`; the deny list now enumerates the real env filenames), dropped
      the brittle `Bash(cat/grep/head/… .env*)` rules, build-output Read denies, and
      phantom-path denies (vault/secrets/dumps/certs that never existed), and added
      OS-level `sandbox.filesystem.denyRead` for the real env files (merges into the
      app-managed Seatbelt sandbox; `sandbox.enabled: true` at project scope was tried
      and reverted — it hot-loads into live sessions and broke tsx's IPC socket during
      `check:fast`). CLAUDE.md cut roughly in half: the slash-command
      table and memory section went (both auto-surfaced by the harness), the two
      overlapping git-safety sections merged, Markdown-tooling rationale moved to
      AGENTS.md. Micro: `ship.md` co-author line de-pinned from "Opus 4.8";
      `clean-worktrees` dropped the vestigial `gh pr list` merged-PR check (the
      local-first flow has no PRs).
- [x] **Production guard for destructive DB tasks** _(2026-07-30)_ — `db:reset:prod` /
      `db:seed:prod` (and any `:dev` → `:prod` typo) could wipe/seed the production DB with
      one command. Added `devtools/shared/db/prod-db.guard.ts`: reset/seed now refuse to run
      when `DATABASE_ENV` is `production` (missing/unrecognized fails closed) unless
      `CONFIRM_PROD_DB=yes` is set; blocked runs exit 1 via `runCli`. 17 unit tests (vitest
      unit lane now also picks up `devtools/**` tests); docs updated (drizzle, deployment,
      getting-started, scripts guide, README). _Follow-up fix (same day): the guard's
      `env = process.env` default failed TS2559 in CI/Vercel only — `experimental.typedEnv`
      derives ProcessEnv's keys from the env files present, and CI has none — the first real
      cross-lane **semantic** merge conflict (both lanes were green on their own bases; git
      merged cleanly; the type contract broke). Fixed by reading the two keys individually,
      matching `env-access.utils.ts`. Lane-map lesson: run `check:fast` on the merged tree
      before pushing, not just on the branch._
- [x] **Real landing page (first impression)** _(2026-07-30)_ — replaced the Next.js Learn
      boilerplate `/` (course welcome, course link, course hero screenshots) with a real
      portfolio landing: honest hero copy, one-click **Try the demo** (reuses
      `demoUserAction` via `DemoForm`, which gained optional `className`/`size`/`variant`
      pass-through), a pure-CSS architecture card (feature modules × layers, linking to
      `docs/diagrams` on GitHub — zero-drift alternative to screenshots), an
      engineering-highlights grid, and GitHub links. Root metadata de-boilerplated
      (real description; `metadataBase` → the live Vercel URL). Removed the broken global
      `p { font-family: var(--font-eyegrab) }` rule (merienda was never loaded under that
      family name, so paragraphs app-wide silently fell back to system sans; body text now
      actually renders Noto Sans). Deleted three unreferenced course assets
      (`hero-desktop.png`, `hero-mobile.png`, `opengraph-image.png`). Cypress: smoke spec
      rewritten (headline + GitHub-link assertions + a new landing→demo→dashboard test),
      shared selectors/regex/urls updated, `logoutViaForm` re-anchored to the new headline.
      A 14-finding adversarial review pass then hardened it: CTA + PostgreSQL-chip colors
      re-pinned to WCAG-AA pairs (semantic active/hover tokens fail AA in dark), the landing
      axe check made **blocking** (`skipFailures` dropped — it was silently advisory),
      header/footer hoisted out of `<main>` for real landmark roles, `DemoForm` errors got
      `role="alert"` + a `dataCy` prop decoupling test ids from a now-human aria-label,
      the demo-redirect assertion got the suite's 20s timeout, and copy tightened to
      "push to main" / "layering pattern" for literal accuracy.

- [x] **TypeScript 7 upgrade** _(2026-07-28)_ — typescript `^6.0.3` → `^7.0.2` (native compiler)
      on next 16.2.12 (16.2.11 crashes outright on TS7). tsconfig: dropped `baseUrl` +
      `ignoreDeprecations` (removed in TS7). next.config: `experimental.useTypeScriptCli: true`
      (TS7 drops the old compiler API). Cypress needed real work: bumped to `^15.19.0`
      (adds TS7 spec preprocessing) but its bundled Babel fallback is packed broken, so
      the npm `@cypress/webpack-batteries-included-preprocessor@^4.2.0` is wired explicitly in
      `cypress.config.ts` with `@cypress/webpack-preprocessor@^7.1.1` (4.2.0's declared peer
      `^6.0.4` is stale — 6.x lacks `getResolvedTypescriptVersion`). `cypress/tsconfig.json`
      re-adds `baseUrl` locally (tsconfig-paths still needs it for aliases; that file is outside
      the `tsc -b` graph so TS7 never sees it). Also restored the `next` caret (`^16.2.12`,
      closing the 2026-07-27 backlog item) and closed the old "TSConfig modernization for TS 6.0"
      item (superseded). Verified: check:fast, unit 289/289, e2e 35/35, production build.
      This also lands the cypress part of Dependabot #113 early. Full recipe in memory
      (`project_ts7_and_release_age_gotchas`).

- [x] **Forgot-password request flow (ADR-006 in the product)** _(2026-07-22)_ — replaced the
      live stub at `/auth/forgot-password` with a real request-reset form: email-only schema,
      `requestPasswordResetAction` that after validation does **no user lookup and no branching
      on account existence** (response identical by construction — the ADR-006 story), generic
      "if an account exists…" confirmation plus an honest "Demo project: no reset email is
      actually sent." caption. Route added to `ROUTES.auth` + `PUBLIC_ROUTES` (authenticated
      users bounce to dashboard like login/signup). Deliberately out of scope: tokens, email
      delivery, set-new-password page. Tests: 3 unit (incl. the identical-response ADR-006
      lock) + 3 e2e (login-page link, confirmation swap, seeded-vs-unknown email parity).
- [x] **Dependency catch-up + audit overrides** _(2026-07-22)_ — landed the 4 stale PRs: #107
      weekly maintenance (next 16.2.10, biome 2.5.2) + #108 Actions bumps merged; #105 closed
      (superseded by #107); #109 superseded by a local commit applying its 13 clean bumps while
      **holding biome at 2.5.2** (2.5.3 panics on 8 form tsx files with exit 0 — silent lint
      loss; memory `project_biome_nested_config`). Added audit overrides for 4 new highs:
      brace-expansion ^5.0.7, js-yaml ^4.3.0, linkify-it ^5.0.2, sharp ^0.35.3 (next pins
      ^0.34.5 — override until next bumps; prod build + native load verified). `pnpm audit`
      clean, all Dependabot alerts closed.
- [x] **Single-branch, local-first model (retired `develop`)** _(2026-06-25)_ — collapsed the two-tier
      `develop → main` model back into a single `main` branch. `main` is the default again; feature work
      happens in worktree branches and is **merged into `main` locally** (worktrees share one object
      store — no remote round-trip, no PRs), then pushed. CI (`ci.yml`, `codeql.yml`) now triggers on
      push to `main` only; the slow E2E runs on every `main` push as a safety net (no pre-merge gate —
      `pnpm check:fast` is the local pre-push gate). Relaxed the `main` ruleset to allow direct pushes
      (kept no-force-push + no-delete), deleted the `develop` ruleset, retired the `develop` branch, and
      rewrote `/ship` (now hands off a local merge; `/promote` deleted). Docs reconciled
      (`branching-and-releases.md`, the flow diagram, `lane-map.md`, CLAUDE/AGENTS). Rationale: the
      remote-first PR flow created friction (stale local branches, GitHub as the orchestration point)
      that blocked real use during the job hunt. Detail: memory `project_branch_model_migration`.
- [x] **Docs-drift audit — remaining md files** _(2026-06-25)_ — drift-checked the ~53 prose
      markdown files yesterday's sweep didn't touch (ADRs excluded) via 7 read-only audit lanes;
      48 clean, **5 fixed**: `docs/knip.md` (`ignoreDependencies`), error-handling standard
      (`normalizeUnknownError`), `src/shared/README.md` (real dir list),
      `src/shared/core/config/README.md` (real env exports), `cypress/README.md` (now in CI / no
      skips). Surfaced a separate gap — ~12 empty/template module READMEs — now tracked under "Now".
- [x] **Docs-drift reconciliation sweep** _(2026-06-24, #97–#100 → develop, promoted #101)_ — the
      first real **parallel-lane run**: four worktrees, each scoped to non-overlapping docs —
      customers/banner (#97), invoices (#98), auth/users (#99), shared/cross-cutting (#100) — re-verified
      each module's README/standards against the current code and corrected the drift (24 files,
      +349/-249, docs-only). Promoted `develop → main` as a merge commit (#101): the first **clean**
      promote after the #96 divergence heal — both file diff and commit list showed only the four real
      docs commits. Validated the lane workflow end-to-end; the cross-module type-contract safeguards
      weren't exercised (docs touch no types). Detail: memory `project_docs_consolidation`,
      `project_branch_per_architecture_idea`.
- [x] **Two-tier branch model: `develop` → `main`** _(2026-06-23)_ — reworked the git strategy for
      parallel multi-session work: `develop` is now the **default** branch (integration), `main` is
      promote-only (production). GitHub rulesets gate `develop` (`Lint & type-check`) and `main`
      (`+ E2E (Cypress)`); `ci.yml` split so the slow E2E runs only for main-targeting PRs (#89);
      branch model + Mermaid diagram documented (#90); Vercel verified (main=production,
      develop=free staging URL); added the `/promote` command + updated CLAUDE.md/AGENTS.md
      git-safety wording; the lane map landed (`docs/lane-map.md` + diagram). ⚠️ Rulesets pin required-status-check
      contexts to the CI job **names** (`Lint & type-check`, `E2E (Cypress)`) — rename a job and
      merges silently block. Detail: memory `project_branch_model_migration`.
- [x] **Worktree/branch cleanup tooling** _(2026-06-23, #88)_ — added a `/clean-worktrees`
      command (`.claude/commands/clean-worktrees.md`): fetch → classify `[gone]`/merged/empty
      lanes (verified via `gh` PR state or `ahead=0`) → auto-remove only **clean** worktrees
      (never `--force`) → emit a paste-ready `git branch -d` block (branch deletion stays denied
      in `settings.json`, so the human runs it) → report. Skips the current session, `main`, and
      `archive/*`. Plus a read-only `SessionStart` hook (`.claude/hooks/stale-worktrees.sh`, wired
      in `settings.json`) that nudges when stale lanes exist and stays silent when clean. Also
      fixes the `/clean_gone` plugin command's latent bug: it greps `git branch -v`, which never
      shows `[gone]` (needs `-vv`).
- [x] **`/ship` command + insights-report tooling docs** _(2026-06-23, #86 + reorder follow-up)_ —
      added `.claude/commands/ship.md` (end-to-end PR loop: branch-safety → review → reconcile →
      `check:fast` gate → commit → push → PR → CI-watch; worktree-only), an AGENTS.md
      "Shell environment" section (macOS/zsh footguns: no `timeout`/`mapfile`, the `tail`/`head`
      exit-code mask), and CLAUDE.md workflow/git-safety/worktree context from the report blocks,
      deduped against AGENTS.md. Sourced from a `/insights` report; its
      first run (#86) exposed a step-order bug — reconcile ran after the commit — fixed in the
      follow-up so doc/backlog updates land in the same PR.
- [x] **Dependency-audit watch: 2 moderate alerts cleared** _(2026-06-23, #85)_ — the two
      transitive dev-tooling quadratic-DoS advisories pulled via `markdownlint-cli2@0.22.1`
      (latest, which pins both exactly so no upstream bump was possible) fixed with
      `pnpm-workspace.yaml` overrides: `js-yaml ^4.2.0`
      ([GHSA-h67p-54hq-rp68](https://github.com/advisories/GHSA-h67p-54hq-rp68)) +
      `markdown-it ^14.2.0`
      ([GHSA-6v5v-wf23-fmfq](https://github.com/advisories/GHSA-6v5v-wf23-fmfq)); `pnpm audit`
      → 0. Earlier: the `form-data` HIGH cleared upstream + biome 2.5.0 adopted. Ongoing audit
      watch continues via the `weekly-maintenance` routine.
- [x] **Phase 4 CI: e2e + branch protection** _(2026-06-23)_ — Cypress e2e wired into
      `ci.yml` as a parallel `e2e` job (Postgres service container, runner-generated
      `.env.test.local`, migrate→seed→`cy:e2e`; PR #80, green ~3m), and `main` branch
      protection fixed via `gh api` to require `check` + `E2E (Cypress)` with 0 approvals.
      Completes the deploy plan. ⚠️ If the ci.yml job names change, update the ruleset's
      required-status-check contexts or merges silently block. Detail: memory
      `project_dashboard_plan`.
- [x] **Biome deterministic lint + `noConsole`** _(2026-06-23, #78/#79)_ — consolidated the
      nested `biome.json` into root `overrides` (fixes the 2.5.0 non-deterministic
      nested-config scan), enabled `noConsole` routing app/DAL console through the structured
      logger (logger/CLI/config exempt), and cleared all remaining Biome warnings/info.
      Detail: memory `project_biome_nested_config`.
- [x] **knip full-report triage** _(2026-06-14)_ — 44 findings → 5 (all deliberate
      keeps) via adversarial multi-agent triage: deleted 10 dead files + dead symbols +
      2 unused deps, un-exported the rest. `check:fast` + 286 unit green.
- [x] **Vitest Phase 3** _(2026-06-14)_ — breadth characterization tests (forms #48,
      invoices/customers #70, server #71 → unit lane 286) + coverage floors in
      `vitest.config.ts` + DB-free unit lane wired into CI (#72); `TZ=UTC` pin. Detail:
      memory `project_vitest_improvement`.
- [x] **Per-env migration drift guard** _(2026-06-14)_ — `pnpm db:drift`
      (`devtools/cli/migration-drift.cli.ts`) asserts the dev/test/prod migration sets
      describe the same final schema; env-free, wired into `check:fast` + CI.
- [x] **e2e port-reuse guard** _(2026-06-13)_ — fixed the trap that let `cy:e2e` hit the
      wrong server: the harness now owns `PORT` from `.env.test.local`, and a
      `/api/health` preflight aborts unless `databaseEnv === "test"`. Detail: memory
      `project_cypress_improvement`.
- [x] **Env hygiene** _(2026-06-13, PR #67)_ — removed dead `LOG_LEVEL` plumbing,
      hardcoded `SESSION_ISSUER`/`SESSION_AUDIENCE` as constants (were single-literal
      enums), dropped a debug log. Behavior-preserving.
- [x] **Secrets out of `Cypress.env()`** _(2026-06-13, PR #66)_ — stopped writing
      `DATABASE_URL`/`SESSION_SECRET`/`DATABASE_ENV` into `config.env`; added a non-secret
      `db:env` task + `allowCypressEnv: false`. Detail: memory `project_cypress_improvement`.
- [x] **Forms/error roadmap complete** _(2026-06-13)_ — shrink→lock→decide→reshape done
      (#45–#52, #63, #64): 68 lock tests, ADR 001 null-idle, allowlist echo, shape-based
      field-error detection, single `toFormErrorPayload`. Core layering unchanged. Detail:
      memory `project_forms_error_refactor`.
- [x] **Live deploy** _(2026-06-13)_ — Vercel + Neon live at
      <https://nextjs-dashboard-beige-pi-12.vercel.app/> (URL in README), $0 on free
      tiers. Builds on the Docker standalone stack + `/api/health` (#35) and the Neon prod
      DB + `0006` seed backfill (#44).
- [x] **Auth/invoices structure fixes** _(2026-06-13)_ — all 5 fixes from the 2026-06-12
      assessment (verdict: no restructure): auth leaf-dir flatten (#57), `toSessionPrincipal`
      narrowing + drop auth's only app→infra import (#58), invoices reads routed through
      `InvoiceService` (#59). Detail: memory `project_structure_assessment`.
- [x] **Weekly maintenance routine** _(2026-06-13)_ — live `/schedule` agent
      (`weekly-maintenance`, Mondays ~9am Central): codemods + dep-pin/drift/knip+audit in
      one weekly PR. Spec: `docs/weekly-maintenance-routine.md`.
- [x] **knip residue (named seven)** _(2026-06-11)_ — un-exported 5 internal types +
      collapsed 2 duplicate-export pairs (#46/#47).
- [x] **Dead-seam sweep** _(2026-06-11)_ — deleted dormant result combinators (4 files,
      ~965 lines) + orphaned guards/helpers (#45); result module 1,253 → ~240 lines.
- [x] **Server Action serialization** _(2026-06-11)_ — `FormResult` carries
      `AppErrorJsonDto` (not an `AppError` instance) across the `useActionState` boundary
      (#41), fixing the progressive-enhancement serialize warning.
