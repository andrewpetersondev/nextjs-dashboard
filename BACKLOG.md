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

- [x] ~~**Renovate adoption** ([#124](https://github.com/andrewpetersondev/nextjs-dashboard/issues/124))~~
      — **DROPPED 2026-08-07. Do not re-propose.** Fully built and validated on
      `claude/issue-124-326e7f` (config, grouping, lockstep rules, automerge, docs), then
      **reverted** — installing the Mend Renovate GitHub App asked for credit-card details at
      the GitHub Marketplace checkout, and that is not a cost this project takes on. Dependabot
      stays. The build is recoverable from `main`'s own history if the calculus ever changes —
      `9e41b2c8` (Renovate) and `58aff82f` (automerge), undone by `00966804`; nothing depends on
      the `claude/issue-124-326e7f` branch surviving. Two findings from the attempt outlived it
      and are listed below.

- [x] ~~**Bot PRs run essentially no CI**~~ — fixed 2026-08-09, see Done.

- [x] ~~**`postcss` override has drifted from its dependency**~~ — fixed 2026-08-07. Override
      resynced `^8.5.24` → `^8.5.25` to match the `package.json` devDependency, lockfile
      regenerated (its `overrides:` block records the range, so leaving it stale would have
      failed CI's `--frozen-lockfile`). Verified still one `postcss@8.5.25` copy. The override
      itself stays: `next@16.2.12` still pins `postcss 8.4.31` exact, so dropping it forks the
      graph into two copies. Two structural fixes were considered and rejected — pnpm's
      `"$postcss"` reference works but pnpm 11 warns it is **deprecated** in favour of
      catalogs, and catalogs would make `package.json` read `"postcss": "catalog:"`, which
      Dependabot cannot bump. See the override-drift guard below for the durable fix.

- [x] ~~**Node version declared in three files that never agree**~~ — fixed 2026-08-07.
      `.nvmrc` and the `Dockerfile` said **26** while `engines.node` said `>=24`, which Vercel
      resolves to the newest major it offers — and Vercel tops out at **24.x** and never reads
      `.nvmrc`. So production ran Node 24 while dev, CI, and Docker ran 26, and nothing
      reported it. **Aligned on 24** (`.nvmrc`, `Dockerfile`, `engines.node: "24.x"`), which is
      the version production was already proven on. Verified first that none of the 392
      packages declaring `engines.node` requires ≥25 (highest floors are cypress/vitest at
      `>=24.0.0`). New gate `pnpm node:drift` keeps the three in sync and additionally rejects
      an open-ended `engines.node` range, since a range lets Vercel move production a major
      with no commit and no CI run. Wired into `check` and `check:fast`. **Superseded 2026-08-09**
      — that wiring turned out to reach no CI job at all, and the guard could not see the Node
      actually running (dev was on 26 the whole time). Both closed; see the Node-runtime-alignment
      entry at the top of this log.

- [x] ~~**No guard on override/dependency drift**~~ — fixed 2026-08-09, see Done.

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
      check is the only signal for `@vercel/next`-side breakage.** Two workarounds are verified
      upstream and **both deliberately not taken** — `output: process.env.VERCEL ? undefined :
      'standalone'` changes the build path that serves the live demo, and prefixing the Vercel
      build command with `NEXT_ADAPTER_PATH=` is an untracked dashboard setting nothing re-checks.
      **Next step:** wait for 16.3.1 stable (none exists as of 2026-08-11; still reproducing on
      `16.3.1-canary.7`), re-read the issue, then bump. The weekly-maintenance routine will
      re-propose 16.3.x every Monday until it lands. Full mechanism in memory
      (`project_next163_standalone_vercel_break`).
      **Origin:** [PR #131](https://github.com/andrewpetersondev/nextjs-dashboard/pull/131), whose
      Biome half (2.5.6 → 2.5.7) was split off and landed separately; the `next` bump and the two
      `pnpm-workspace.yaml` override-comment rewrites that describe 16.3.0 stayed behind on
      `claude/weekly-maintenance-2026-08-09` and travel together whenever the bump is retaken.

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

Terse log — newest first. Full detail lives in the `project_*` memory files.

- [x] **Agent attribution stripped from history, and the git guard that should have gated it made
      real** _(2026-08-11)_ — `main` went `f61a1b44` → `28cda630`. 337 commits rewritten (everything
      before 2026-05-11 kept its SHA): 206 co-author trailers removed, one commit reassigned from an
      `@anthropic.com` author, and the `claude/` segment stripped from 57 merge subjects plus 3 body
      references. 69 PR bodies lost their generated-with footer via `gh pr edit`. **Content was
      provably untouched — all 3319 tree hashes identical before and after**, which is the check
      worth reusing for any future rewrite; a rewrite that changes a tree is a rewrite that changed
      code. `.claude/`, `CLAUDE.md`, `AGENTS.md` and the `fix(claude):` commit scopes were kept on
      purpose: they name files that are really in the repo, and scrubbing them would leave history
      describing a tree that does not exist.
      **Two things a rewrite cannot reach**, both verified against the API rather than assumed:
      GitHub serves commits from `refs/pull/N/head` forever, so the pre-rewrite commits stay
      readable at their old SHAs behind all 119 PRs; and the `claude/*` head-branch name on a closed
      PR is immutable, so 78 PR pages still show it. Only repo deletion or GitHub Support clears
      those.
      **The guard that was supposed to stop all this did nothing.** `permissions.deny` listed
      `Bash(git filter-branch*)` and `Bash(git push --force*)`, and neither fired: denies are
      prefix-only, so `bash rewrite-history.sh` hid the rewrite inside a script and
      `git -C <path> push --force-with-lease` did not start with `git push`. Replaced with
      `.claude/hooks/guard-destructive-git.py`, a `PreToolUse` hook on `Bash` that matches the whole
      command string and also reads any shell script it is asked to run. 23 pipe-tests cover the
      four evasion forms, the bare forms, and the false-positive cases. Also closed two gaps the
      deny list never had: `git filter-repo` (the modern replacement for the tool it did deny) and
      the `+refspec` force-push syntax.
      **The hook itself first shipped broken, in the same shape.** Returning
      `permissionDecision: "ask"` is silently swallowed by the blanket `Bash(*)` allow rule — the
      guarded command ran with no prompt. Only `"deny"` overrides an explicit allow. Caught by
      running the thing end-to-end instead of trusting the config, which is now the documented
      requirement in `AGENTS.md` for any future change here.

- [x] **Full documentation review — every claim verified against code, not read for plausibility**
      _(2026-08-09, `claude/documentation-review`)_ — swept all 82 tracked Markdown files (~12k
      lines). The mechanical passes carried most of the weight: resolve every relative link, every
      `pnpm <script>` reference, and every backticked path against `git ls-files`. **All ~120 script
      references resolve** (the apparent misses are BACKLOG/knip entries _describing_ those as bugs
      already fixed), and only **two broken links existed repo-wide**, both in the forms ADR.
      **The headline finding is drift with a shape worth remembering: local doc updated, global docs
      not.** `93ab1ffb` gave `customers` an `application/` layer and updated
      `src/modules/customers/README.md` — but three cross-cutting docs still said the module skips
      it: `project-structure.md`, `clean-architecture-standards.md`, and the `module-layers.md`
      table that the other two both cite as the authoritative per-module map. So the wrong answer
      was the one a reader landed on. All three now say `banner` is the only module without an
      `application/` layer, and module-layers.md gained a paragraph using `customers` as the worked
      example of _when_ to add one (orchestration arrived: delete guard, patch diffing).
      **Four other real errors.** `getting-started.md` step 6 told you to run `next:build:test`
      before `serve:test` — but `serve:test` starts with `pnpm clean`, so it deleted the build you
      just made; it also ran a long-running server and an interactive runner as one sequential block
      (README got this right, getting-started didn't) and never mentioned the one-shot `pnpm e2e`.
      `testing.md` sent you to reconcile `PORT` with `CYPRESS_BASE_URL` in `.env.test.local` — **no
      such variable exists**; `cypress-env.ts` derives `baseUrl` from `PORT`, so they cannot
      disagree, and the real failure is a stale exported `PORT` (which `cypress-with-server.cli.ts`
      explicitly warns about). `testing.md` also scoped test discovery to `src/` when the unit lane
      also includes `devtools/**` (6 real test files). And `docs/README.md` labelled the forms ADR
      _(proposed)_ when its own Status line reads Accepted — all 8 ADRs are Accepted.
      **Completeness gaps closed.** README tree was missing `test-support/` (and left `src/`
      unclosed); `deployment.md`'s env contract omitted `PORT`; `AGENTS.md` told agents to "ALWAYS"
      read `node_modules/next/dist/docs/` without noting **a fresh worktree has no `node_modules`**,
      so every session was pointed at a path it could not reach; the `/fix` write-lock gotcha
      (latches Edit/Write denial for the rest of the turn) was in memory but not in the command
      guide; `clean-architecture-standards.md` gave a UoW contract path that no implementation uses.
      README's description also covered infrastructure only — no mention of customers/invoice CRUD,
      the status lifecycle, or the revenue chart — which for the resume centerpiece was the gap
      worth caring about most after the layering one.
      **What held up, which is most of it:** the ERD matches the schema exactly (every column,
      default, cascade, unique constraint); the CI docs match `ci.yml` precisely across
      `testing.md` / `branching-and-releases.md` / `AGENTS.md` (job names, both triggers, the e2e
      PR skip); no stale `/promote`, `/check-full`, or `develop` references survive outside
      historical entries; `SECURITY.md` and the command guide's frontmatter claims verified.
      **The naming standard had drifted both ways, and Andrew chose prune + document** (same day,
      no rename). Its suffix table claimed `.record.ts` / `.view.ts` / `.event.ts` with **zero**
      instances each while omitting eight suffixes in real use. Removed the three dead rows —
      each with a line saying why it won't come back (row types are `$inferSelect`-inferred beside
      the Drizzle schema, so a hand-written `.record.ts` could only drift; `.transport.ts`/`.dto.ts`
      already cover `.view.ts`; there is no event bus) — and added `.brand.ts`, `.command.ts`,
      `.validator.ts`, `.guard.ts`, `.utils.ts`, `.mappers.ts`, `.atom.tsx`, `.molecule.tsx`. The
      table now states it is **vocabulary, not inventory**, with a ≥3-instance bar for entry so
      one-off suffixes (`.wrapper.tsx`, `.inspector.ts`, …) don't get cargo-culted.
      **Two findings came out of documenting rather than renaming.** The plural `.mappers.ts` is
      not sloppiness: singular is verb-first and names a layer crossing (`to-auth-user-entity`),
      plural is subject-first and holds a type's own converters (`user-id.mappers.ts`), and 4 of 5
      are branded-primitive constructors — converting _into_ a brand belongs to the brand. The
      exception, `logging.mappers.ts`, is flagged in-doc as mis-suffixed rather than silently
      ratified. Also surfaced: `.brand.ts` and `.value.ts` genuinely overlap (both can declare a
      brand; `hashing.value.ts` exports `Hash` **and** `toHash`), recorded as a real edge instead
      of papered over with an invented rule. `.provider.ts` was **kept**: it sits in the
      infrastructure-seam menu — forward-looking advice for naming something you're about to
      create, where zero current uses is expected — not in the vocabulary table.
      **Writing the invariant as a script caught two things reading would not have.** Asserting
      "every row has instances AND every suffix with ≥3 uses has a row" immediately failed on the
      first draft: `.constants.ts` (**24 uses**, 5th commonest in the codebase), `.types.ts` (7)
      and `.tokens.ts` (3) were documented in later prose sections but absent from the table now
      claiming to be the vocabulary — added as pointer rows, rule stays in its own section. A
      second assertion — every Example File Name is a real tracked file — failed on
      `password-validation.policy.ts`, `login-request.schema.ts` and `login-request.dto.ts`,
      three **pre-existing** cells naming files that have never existed; repointed at
      `password.policy.ts`, `login.form.schema.ts`, `auth-user-create.dto.ts`.
      **And `.tokens.ts` was documented as the opposite of what it is.** The section described
      DI tokens (`export const AUTH_REPOSITORY = Symbol(...)`) and cited `auth.tokens.ts` — a
      real file that holds **UI copy** (`LOGIN_HEADING`). There are **zero** Symbol-based DI
      tokens anywhere; DI is factories + `auth.composition.ts`, which the doc already covers
      elsewhere. Rewritten to describe named literals reused across a surface, with the
      `.constants.ts` dividing line (design decision vs. business fact) spelled out.
      **Open, not actioned:** `LoginRequestDto` is declared inside `login.form.schema.ts` rather
      than a `.dto.ts`, which reads against the doc's own suffix-redundancy rule. That is a code
      question, not a docs one — left for a decision.

- [x] **Seed data rebuilt — deterministic, anchored to today, and shaped to tell a story**
      _(2026-08-09, `claude/revenue-chart`)_ — asked for "better seed data" after the revenue
      chart shipped. The interesting part was not aesthetics: **the seed's periods were anchored to
      a hardcoded `"2025-01-01"`.** `generateMonthlyPeriods("2025-01-01", 19)` ended in **July
      2026**, so on 2026-08-09 the current month had **no seeded invoices at all** — the $555/$765
      August bar in the new chart was hand-created test data, not seed output. And it **rots**: the
      window drifts a month further into the past every month, so by early 2027 the chart's
      12-month view would have been largely empty. Periods are now generated backwards from the
      current month, so a fresh clone looks the same in a year as it does today.
      **It also explained why the chart had almost no pending.** Every seeded invoice sat at least
      a month in the past, so every stored-pending row was past NET-30 and correctly rendered as
      overdue — the pending band had nothing to draw. Recent months now carry invoices young enough
      to still be pending, which is what makes all three buckets visible.
      **Determinism, which fixed a latent test flake as a side effect.** Every draw ran through
      `Math.random()`, so the demo reshaped on every `db:seed` and — more seriously —
      `status-lifecycle.cy.ts` **opens the first overdue invoice** to exercise both transitions and
      asserts the paid bucket is non-empty. Its own comment claimed the bucket was "reliably
      non-empty", but that held only probabilistically; an unlucky run would have failed three
      tests with no code change to blame. Now a seeded mulberry32 PRNG (`SEED_CONFIG.randomSeed`)
      drives everything, plus **anchor invoices** dated relative to `now` that guarantee one of
      each display bucket **by construction** — 45 days ago is always past due, 3 days ago never
      is. A unit test asserts the guarantee, so it is checked in CI rather than assumed.
      **Shape.** Volume ramps 4→9 invoices/month and amounts ramp with it, so the chart reads as a
      growing business rather than noise. Large deals scale with the ramp too — a four-invoice
      month landing a $47k contract produced an early spike that fought the trend. Status mix is
      driven by **month age**, which is the only thing that matters when "overdue" is derived:
      current month is mostly pending, older months mostly paid with a pending tail that renders
      overdue.
      **The `$5.00`line on the dashboard is gone.** ~20% of invoices were drawn from the $0 / $0.01
      / $5 tiers, which is demo litter. Those tiers stay in`SEED_CONFIG`because`seed-amounts.schema-contract.test.ts`pins them against the invoice schema — but they are now
      emitted **once each**, in the oldest month, so they exist in the data without appearing
      anywhere the demo looks.
      **One picture-less customer** (Priya Raghunathan) seeded with`CUSTOMER_IMAGE_URL_NONE`, so
      the initials-avatar path is visible in the demo without creating a customer by hand.
      **A gotcha worth keeping:`pnpm db:reset:dev`is denied to the agent** (the destructive-DB
      deny rules), so the dev reseed is a human step. The seed shape was verified instead by running
      the builder directly and printing the per-month breakdown — no database required, which is a
      better check anyway since it needs no environment.
      **And the e2e port-reuse guard earned its keep**: the first run refused with
      "server reports databaseEnv=development, expected test" because a preview dev server had
      restarted on 3001. That is the guard working, not a failure.
      Validation: Biome slate **0**, typecheck green, knip clean, unit **465/465** (up from 455 —
      10 new covering determinism, the bucket guarantee, the no-future-dates rule, and the`revenue_period = date_trunc('month', date)`CHECK invariant that would otherwise only fail at
      insert time),`check:fast` green, e2e green against a freshly seeded test database.
- [x] **Revenue-by-month chart on the overview — finishing what `revenue_period` was built for**
      _(2026-08-09, `claude/revenue-chart`)_ — Andrew asked whether the dashboard should have
      charts. It should, and the schema had been waiting for one: **`invoices.revenue_period`
      already existed** with a CHECK constraint pinning it to `date_trunc('month', date)`, its own
      index, a branded `Period` type, codecs, seed-time period generation and unit tests — **and no
      query aggregated it.** The whole monthly-revenue substrate was built and never consumed.
      **Deliberately not the tutorial's chart.** This project descends from Next.js Learn, whose
      dashboard has exactly one chart: a monthly revenue bar chart. Reproducing it is the single
      move that makes original work look copied to anyone who has done that tutorial — a large
      share of people screening junior React roles. So the bars are **stacked by invoice status**
      instead, which makes the lifecycle feature visible rather than something to explain, and
      answers a question the stat cards cannot: the "Pending" card reads $247,439.57, merging
      genuinely-pending with long-overdue; the chart splits them and shows that over the last 12
      months **pending is $765 and overdue is $136,185** — essentially all outstanding revenue is
      late. Verified against the live dev data, and August's row ($555 paid / $765 pending) matches
      the two invoices in the list below it.
      **The load-bearing domain constraint: `overdue` is not a stored status.** The enum is
      `pending | paid | void`; overdue is derived at read time. A naive `GROUP BY status` would
      have produced a chart with no overdue bar at all, silently contradicting the badges directly
      beneath it. The repo had already built the seam — `overdueIssueDateCutoff` exists precisely
      as the SQL-side mirror of `dueDateOf` — so the aggregate splits stored-pending with that
      bound parameter and **never re-encodes the NET-terms rule in SQL**, the contract
      `buildInvoiceListWhere` documents. `readRevenueByPeriod` reads `now` **once** for both the
      cutoff and the window: two `new Date()` calls would agree almost always and disagree exactly
      at a month boundary.
      **No chart library, and that was a CSP decision before it was a taste one.** Production runs
      `style-src 'self'`; Recharts, Victory and Nivo all position elements with inline styles,
      which are stripped there — the `next/image` problem from earlier the same day, except
      structural rather than cosmetic. SVG geometry is expressed as **attributes**, which CSP does
      not govern, so a hand-rolled inline SVG in a server component renders identically in dev and
      production, adds **zero dependencies** against a Lighthouse perf score of 100, and hydrates
      nothing. Fills come from the theme's `--color-*` tokens (Tailwind v4 generates `fill-*` from
      them), reusing the status badges' hues so the page teaches one colour language.
      **Two pure functions extracted and tested rather than trusted.** `buildRevenueChartModel`
      owns the geometry — its `isEmpty` guard exists because an all-zero dataset divides by a zero
      axis maximum and writes `NaN` into every coordinate, at which point the SVG renders nothing
      with no error anywhere. `fillRevenuePeriodGaps` pads months the `GROUP BY` omitted; without
      it a quiet month vanishes and every later bar shifts left, an axis that looks continuous
      while misrepresenting time. Period keys are parsed from the **string**, never through
      `new Date(period)`, which is UTC midnight and formats as the previous month in any
      negative-offset zone.
      **Two review findings caught by the tooling, both real.** Biome's `useUniqueElementIds`
      flagged a hardcoded `id` on the chart heading that would collide if a second chart ever
      appeared — a server component has no `useId`, so the region is named with `aria-label`
      instead. And the first version styled the panel `bg-bg-accent`, which is sky-800 in dark
      mode: a loud blue block that would also have swallowed the sky-hued pending bars. Corrected
      to the `bg-bg-secondary` panel + `bg-bg-primary` surface that `LatestInvoices` already uses.
      Accessibility: the `<svg>` is `aria-hidden` and a visually-hidden `<table>` carries the same
      figures at full precision — the table _is_ the accessible chart. The overview is already in
      the dashboard axe spec, so the chart is covered by the existing blocking checks.
      Validation: Biome slate **0**, typecheck green, knip clean, unit **455/455** (up from 432 —
      23 new across the chart model and the window helpers), e2e green including the a11y spec.
      Verified in the browser in both colour schemes, with **zero inline-styled elements** inside
      the chart (so nothing for production's CSP to strip), zero non-finite rect coordinates, and
      no console errors.
- [x] **Empty-`src` regression from customers CRUD — consolidated into one `AvatarMolecule`**
      _(2026-08-09, `claude/next-best-thing-976173`)_ — reported by Andrew from his own console:
      `An empty string ("") was passed to the src attribute` repeating on the dashboard overview.
      **Directly caused by the entry below.** Customers CRUD introduced a new legal value for
      `customers.image_url` — the empty string, meaning "no avatar" — and taught only the
      **customers table** to handle it. Three other components render a customer's avatar, all in
      `invoices`, all fed by joins on `customers.imageUrl`: `latest-invoice-item.tsx` (the overview),
      and the invoices `desktop-table.tsx` / `mobile-table.tsx`. Each passed the value straight to
      `next/image`. So any invoice belonging to an in-app customer broke all three.
      **The lesson is about the shape of the change, not the missed files:** introducing a new
      possible value for an existing field is a change to every consumer of that field, and the
      audit has to be "who reads this?" rather than "what did I write?". Grepping `imageUrl` across
      `*.tsx` would have caught it in seconds before shipping.
      Fixed by consolidating all five call sites onto one `AvatarMolecule` in `src/ui/molecules/`,
      with `toInitials` promoted to `src/shared/primitives/text/` — the concept is generic UI, and
      leaving the fallback inside the customers module would have made `invoices` import another
      module's presentation component. The component's doc comment records that every customer
      avatar must go through it, and why.
      **A second, latent production bug was caught while fixing the first, and it would not have
      shown up locally.** The first version sized the initials tile with an inline
      `style={{ fontSize, height, width }}`. `security-headers.ts` grants
      `style-src 'unsafe-inline'` **only in development**; production runs `style-src 'self'`, which
      strips inline styles — so the tile would have rendered correctly on the dev server and
      **zero-sized on Vercel**. Exactly the silent, screenshot-proof CSP failure recorded in memory.
      Replaced with Tailwind classes, and deliberately with **standard-scale ones** (`h-7`, `h-10`,
      `text-xs`): an arbitrary value like `h-[30px]` only reaches the stylesheet if Tailwind's
      scanner finds that literal, so it fails as a _missing rule_ — class present in the markup,
      element 0×0, nothing errors. Standard-scale classes remove that failure mode instead of
      relying on the scanner. Avatars are now a uniform 28px app-wide (the customers table was 30px),
      which also made `src/ui/styles/images.tokens.ts` dead — deleted, per knip.
      Validation: Biome slate 0, typecheck green, knip clean, unit 432/432, e2e green, and all three
      previously-broken surfaces confirmed in the browser rendering a "BN" tile for an in-app
      customer with **zero empty-`src` images and no inline `style` attribute** on the tile.
- [x] **Customers CRUD — closing the last read-only island on the demo surface**
      _(2026-08-09, `claude/next-best-thing-976173`)_ — found by asking what was left on the
      demo surface rather than on this list: **`/dashboard/customers` was a first-class sidebar
      item, peer to Invoices and Users, that could only be read.** Both siblings had full CRUD;
      customers had three `read-*` actions and nothing else, so a hiring manager clicking through
      in 60 seconds hit a section that visibly did less than its neighbours with no explanation.
      The "kill the demo dead-ends" pass missed it because that audit hunted for things that were
      **broken** — stub pages, 404ing buttons, template SVGs — and a page that works correctly
      while doing less than its siblings is invisible to that lens. **Absence is much harder to
      audit for than breakage.**
      **The load-bearing find was in the schema, not the UI: `invoices.customer_id` is declared
      `ON DELETE CASCADE`.** So the obvious implementation — wire up a delete button — would have
      let one click silently destroy a customer's entire invoice history and shift the dashboard's
      revenue cards, with no warning and no way to tell what happened. Andrew's call: **refuse the
      delete while invoices exist** and name the count ("Cannot delete Amy Burns — 10 invoices
      reference this customer."). The decision is a pure `evaluateCustomerDeletion`, mirroring
      `classifyFreshness`, so the boundary (exactly zero) is pinned by tests instead of buried in
      the I/O path. A **blocked delete is modelled as an outcome value, not an `Err`** — a customer
      who still has invoices is an expected state of the world, and collapsing it into an error
      would leave the action unable to distinguish "database is down" from "this customer has
      invoices". Known limitation recorded in the module README: it is check-then-act, so an
      invoice created between the count and the delete is still cascaded; the durable fix is
      `ON DELETE RESTRICT`, not more application code.
      **Second constraint, also from outside the module: `next.config.ts` declares no
      `images.remotePatterns`**, so `next/image` can only serve the six local avatars under
      `public/customers/`. A free-text image-URL field would have looked fine in the form and then
      failed at the optimizer for every customer created. So the create form has **no image field
      at all**; new customers store `CUSTOMER_IMAGE_URL_NONE` and render an **initials tile** built
      from existing semantic tokens — a generated per-customer palette would need its contrast
      re-verified against both schemes, and the axe checks block on moderate-impact violations.
      **Adding writes forced the module's first `application/` layer** — its README had explicitly
      justified not having one ("without writes there is nothing for a service to orchestrate").
      Built to the standard rather than to the siblings: a `CustomerRepositoryContract` **port** in
      `application/contracts/` so the dependency arrow points inwards, and writes return
      `Result<T, AppError>` via `executeDalResult` as
      `error-handling-and-result-pattern.md` requires. **The module now reports failure two ways**
      — new writes return `Result`, the older reads still throw — and that split is documented in
      both the repository and the README rather than papered over; converting the reads has its own
      callers and tests and is a separate change. Duplicate email needed no bespoke detection:
      `normalizePgError` already maps Postgres `23505` to a `conflict` key, and `customers.email`
      carries the table's only unique constraint, so the message lands on the right field.
      Authorization is **`requireSession`, not `requireAdmin`** — customers are business data like
      invoices, not account management like users — and that was verified by driving the whole
      flow as the seeded non-admin `user@user.com`.
      **Two defects caught by the work itself, both worth keeping.** (1) A unit test caught a bug
      in `toCustomerInitials` that the function's own doc comment claimed to prevent: it iterated
      with `Array.from` to avoid splitting a surrogate pair, then ended with `.slice(0, 2)`, which
      counts **UTF-16 code units** — so "🦊 Fox" came back as "🦊" with the "F" truncated away. The
      fix caps the WORD list, never the joined string. **A guard that re-introduces its own bug two
      lines later is exactly what a test is for.** (2) `customers-table.tsx` carried
      `aria-labelledby="customers-heading"`, a hardcoded string pointing at an id that never
      existed — the `H1` uses a generated `useId`. Fixed while making the component the owner of
      the shared delete state. Also dropped a `cursor-pointer` from the desktop row, which promised
      a click target the row never had.
      **The delete state is lifted to one `useActionState` in `CustomersTable`**, not one per row:
      per-row state would mount one `role="alert"` live region per customer, and a refusal would
      then be announced from whichever of N identical regions happened to update.
      **Coverage gap closed in passing: the dashboard a11y smoke spec never visited
      `/dashboard/customers`** — it checked invoices, users and the overview only. The page that
      just gained icon-only per-row controls and a generated avatar was the one page with no axe
      coverage; the customers list and the create form are now both in that spec.
      Validation: Biome slate **0 diagnostics** (listed, never read off the exit code — and every
      finding fixed by reordering or extraction, not suppression), typecheck green (app + Cypress),
      unit **432/432** (up from 398 — 34 new, incl. `CustomerService` proving a blocked delete
      never reaches `repo.delete`), knip exit 0, `check:fast` green with all three drift gates
      reporting. Runtime-verified against the dev server end to end: refusal on a customer with 10
      invoices (invoice counts confirmed unchanged afterwards), create with normalization
      (`"   Sofia    Nakamura-Reyes  "` → `Sofia Nakamura-Reyes`, `"  SOFIA@Example.COM "` →
      `sofia@example.com`), initials avatar, duplicate-email rejection on a mixed-case address,
      edit persistence, and a successful delete of a zero-invoice customer.
      **Follow-up not taken (deliberate, matches the siblings):** a failed create does not echo the
      submitted values back into the form — `makeFormError` passes `formData: {}`, exactly as the
      users and invoices forms do — so a duplicate-email rejection clears both inputs. Fixing it is
      a shared-forms change, not a customers one.

- [x] **Node runtime alignment — `.nvmrc` finally applies locally, and `node:drift` reaches CI**
      _(2026-08-09, `claude/node-runtime-alignment`)_ — found while reading the output of the
      override-drift gate: every pnpm command was printing
      `[WARN] Unsupported engine: wanted {"node":"24.x"} (current: v26.5.0)`. The repo has been
      aligned on 24 since 2026-08-07 and `pnpm node:drift` proved it — but the guard compares the
      three **declarations** against each other and never looks at `process.versions.node`, so all
      three could agree perfectly while the workstation ran something else. It did, for two days.
      **Root cause was two independent things, both needed fixing.** `~/.nvm/alias/default` held
      `26`, so every new shell started on 26.5.0; and `~/.zshrc` loaded nvm but had **no `.nvmrc`
      auto-switch hook**, so `cd`-ing into the repo never read the file. Net effect: `.nvmrc` had
      never been consulted on this machine at all — it only ever governed CI. Node **24.19.0 was
      already installed** and ships pnpm 11.20.0, exactly matching `packageManager`, so the switch
      cost nothing. Fixed with a `chpwd` hook in `~/.zshrc` (Andrew's choice: hook only, default
      alias left at 26 so other projects are unaffected — which is what `.nvmrc` is _for_). The hook
      is nvm's own README version with one deliberate change: it does **not** auto-install a missing
      version, because downloading a Node major as a side effect of `cd` is too surprising. Verified
      both directions — inside the repo `node --version` is v24.19.0 and the pnpm warning is gone;
      outside it reverts to the 26.5.0 default. Recorded in `docs/getting-started.md` so the next
      clone does not inherit the same blind spot (the file is outside the repo, so the doc is the
      only durable form).
      **`node:drift` now asserts the running major too**, as a fourth axis — **hard failure in CI, a
      warning locally** (Andrew's call). The asymmetry is the point: in CI the running version comes
      from `.nvmrc` via `actions/setup-node`'s `node-version-file`, so a mismatch there cannot be
      somebody's shell and means a job stopped reading it; locally the cause is a shell that has not
      switched, and failing `check:fast` over a workstation setting is how a gate teaches you to
      bypass it — the same reasoning that keeps knip out of `check:fast`. Detected via `CI`, with
      `CI=false`/`0` honoured. Establishes the repo's first CI-detection convention.
      **The load-bearing find, and it nearly made the whole decision vacuous: `pnpm node:drift` was
      wired into NO CI job.** It had run in `check`/`check:fast` since 2026-08-07 and in nothing
      else — so "fail in CI" would have been unreachable code. This is the third instance of the
      identical flaw (knip ran only via a `check:repo` nobody called; an earlier standalone typecheck
      script died the same way), and it is the reason the runtime check was verified by _running_
      each branch rather than by reading the config. Added as a **`Node drift` step** in the existing
      `Lint & type-check` job — a step, never a new job, since required-status-check contexts pin job
      NAMES.
      Validation: all four branches executed rather than reasoned about — Node 24 + no CI → OK exit 0;
      Node 26 + no CI → WARN exit 0; Node 26 + `CI=true` → FAIL exit 1; Node 24 + `CI=true` → OK exit
      0 (the real CI case, checked so the new gate cannot redden every build). Plus Biome slate 0,
      `check:fast` green, unit 398/398, knip exit 0, and `ci.yml` re-parsed to confirm step order,
      renumbered comments, and unchanged job names.
- [x] **Gating the dependency-update path — CI on bot PRs + an override-drift guard**
      _(2026-08-09, `claude/dependency-update-gates`)_ — the two remaining "Later" items turned out
      to be one story, so they landed together: **the path a dependency bump takes into `main` was
      ungated at both ends.** Under the local-first model a human's merge is gated by the WebStorm
      review; a bot's merge was gated by nothing comparable.
      **(1) CI now runs on `pull_request`.** [`ci.yml`](.github/workflows/ci.yml) triggered only on
      `push: [main]`, and the ONLY workflow on `pull_request` was
      [`dependency-review.yml`](.github/workflows/dependency-review.yml) — an advisory scan against
      the GitHub Advisory Database with **no build, no types, no tests**. (Re-verified rather than
      trusted: `codeql.yml` is also `push` + schedule.) So every Dependabot PR and every
      weekly-maintenance PR merged on an advisory scan alone, and the first real execution against
      it happened once it was already on `main`. Added `pull_request: branches: [main]`, with
      **`E2E (Cypress)` skipped on PRs** via `if: github.event_name != 'pull_request'` — Andrew's
      call. At ~15 min e2e is by far the most expensive job and a bot PR would pay it twice (PR +
      merge push); the other three still deliver lint, types, all three drift gates, dead code,
      unit + coverage, the DB-backed integration lane and a real production build with the CSP
      guard in a few minutes. **No e2e coverage is lost** — it arrives just after the merge instead
      of just before it, which is exactly where it already was. Checked and safe: `dependabot/*`
      branches don't match the push trigger, so there is no double pre-merge run; and **no job here
      reads a repository secret** (the DB lanes write `.env.test.local` from non-secret literals,
      `csp` uses inline dummies), so these run unchanged on Dependabot PRs where `GITHUB_TOKEN` is
      read-only. All four job NAMES left untouched — required-status-check contexts pin names.
      **(2) New `pnpm deps:drift` gate.** Nothing asserted that a `pnpm-workspace.yaml` `overrides`
      entry still matched the `package.json` range for the same package — the rule existed only as a
      **comment** above the `postcss` entry ("⚠ MUST equal the `postcss` devDependency range"), and
      it had already failed once (drifted 2026-08-05 → 2026-08-07). Same genre as knip-that-nothing-ran
      and the three disagreeing Node versions: a documented rule with no executable gate. Only the
      **overlap** is compared — `esbuild`, `vite` and `sharp` are override-only by design, so today
      `postcss` is the single package checked (verified against `package.json`, not assumed).
      Equality is **exact string equality**, not semver compatibility: "compatible but different" is
      precisely the state that produces a second copy of a package, which is what the override
      exists to prevent. Wired into `check`, `check:fast`, **and** a `Dependency drift` step in the
      CI `check` job — a step, never a new job. In `check:fast` unlike knip, and that distinction is
      deliberate: mid-feature code legitimately has an unused export, but nothing is ever
      half-finished into an out-of-sync override.
      **The design point worth keeping is anti-vacuity.** A guard's dangerous failure here is not a
      crash but a silent one — a hand-rolled YAML parser that stops matching the file and returns an
      empty map becomes a permanent green light. So: the parser **throws** when the block is absent,
      empty, or contains a line it cannot read (nested structure is an error, never a skipped line),
      and the OK output always names what it compared (`1 overlapping package(s) agree (postcss);
      3 override-only (esbuild, vite, sharp)`) so a run that checked nothing cannot look like a
      clean one. The parse + comparison live in `devtools/shared/override-drift.ts` with 12 unit
      tests; the CLI is I/O only — the same pure-decision split as `classifyFreshness`.
      **Validated by negative test, not just the happy path:** faking the 2026-08-07 postcss drift
      produced the expected exit 1 with a remedy, and renaming the `overrides:` key produced the
      "cannot verify anything" failure instead of a vacuous pass. **A gotcha that cost real time and
      is worth remembering: mutating `pnpm-workspace.yaml` as a test fixture is not free.** `pnpm`
      auto-installs before running a script, so the edited overrides were resolved for real — pnpm
      installed **three extra copies of esbuild and the vulnerable `sharp` line**, rewrote
      `pnpm-lock.yaml`, and after `git checkout` of both files left `node_modules/.pnpm` still
      linking `next` → `postcss@8.4.31`, which neither `--frozen-lockfile` nor `--force` repaired
      ("Already up to date"). Committed state was never affected. Probe the exported functions
      directly, or accept that recovery needs a `node_modules` wipe.
      Validation: Biome slate **0 diagnostics** (listed, never read off the exit code), `check:fast`
      green with all three drift gates reporting, unit **398/398**, knip exit 0 (its two "unused
      exported type" findings resolved the 2026-08-06 way — un-export, don't delete: the CLI reads
      both types through inference), typecheck green, and `ci.yml` re-parsed to confirm both
      triggers, the `e2e` condition, the new step's placement, and that all four job names are
      unchanged. Integration/e2e not run locally — this worktree has no `.env.test.local`; CI is the
      first real proof, and no runtime path changed.
- [x] **knip triage + wiring it into a pipeline that runs** _(2026-08-06,
      `claude/what-is-next-6181ec`)_ — `pnpm knip` was exiting 1 on `main` and nothing noticed,
      because **nothing executed it**: not `check`, not `check:fast`, not CI. Its only caller was
      `pnpm check:repo`, a name that appeared in three docs and in no workflow. Same
      "wired into no pipeline" flaw that killed an earlier standalone typecheck script.
      **The four findings were not what the label suggested.** knip says "unused export", which
      reads as dead code; **three of the four were used inside their own file** and merely exported
      too widely, so the fix was to drop `export`, not to delete: `extractServerActionFields`
      (called by `buildServerActionBody` beside it — the module's surface is `extractForm` +
      `buildServerActionBody`), `INVOICE_STATUS_TRANSITIONS` (the table behind three exported
      accessors; un-exporting stops a caller reading it raw and bypassing the `from === to` no-op
      rule that `canTransitionInvoiceStatus` adds), and `DomainConflictMetadata` (a member of the
      exported `ConflictErrorMetadata` union, which stays the public vocabulary — re-export the arm
      the day something narrows to it). This mirrors the 2026-06-11 "knip residue" pass, which also
      resolved to un-exporting internal types rather than deleting them.
      **One was genuinely dead and got deleted:** `isInvoiceDisplayStatus`, a guard narrowing
      `InvoiceStatusFilter` → `InvoiceDisplayStatus` by excluding `"all"`. Zero references anywhere,
      and **superseded rather than merely unadopted** — the one site that would use it,
      `statusCondition` in `invoice-list-where.ts`, handles the same narrowing with an exhaustive
      `switch` + `const exhaustive: never`, which buys compile-time exhaustiveness the guard cannot.
      Its now-unused `InvoiceDisplayStatus` type import went with it.
      **Wiring, decided rather than defaulted:** knip added to `pnpm check` (after `db:drift`) and as
      a **`Dead code` step in the CI `Lint & type-check` job** — a step, never a new job, since
      required-status-check contexts pin job NAMES. `check:repo` **deleted**: with knip inside
      `check` it would have run knip twice, and `check` being a true superset is the rule established
      2026-08-05 when `db:drift` was added to it for the same reason. Deliberately **not** in
      `check:fast`: that is the pre-commit loop, and mid-feature code legitimately has an export
      whose consumer does not exist yet — blocking every commit on that trains you to bypass the
      gate. Cost is not the reason (knip is ~1.12s, cheaper than `typecheck`'s 1.7s); placement is
      a workflow call. The `weekly-maintenance` routine still reports knip, but it is a lagging
      report and demonstrably never blocked this drift.
      **Recorded in `docs/knip.md` so it is not "fixed" later:** `entry` lists `src/**/__tests__/**`
      and _looks_ like it under-covers the four test files under `devtools/**`, but knip's **vitest
      plugin** derives test entries from `vitest.config.ts` and already covers them — verified by
      running it. The near-identical-looking Biome override in the entry below had the real version
      of that bug; only one of the two configs was broken. Validation: knip exit 0, `check:fast`
      exit 0, unit 386/386, `ci.yml` re-parsed to confirm step placement and that all four job names
      are unchanged. Integration/e2e not run — this worktree has no `.env.test.local`; CI is the
      first real proof, and no runtime path changed.
      **Follow-up the same day — the un-exports tripped `useExportsLast`.** Dropping `export` from a
      function in the MIDDLE of a file turns the ones above it into "exports not last": `extractForm`
      and `InfrastructureErrorMetadataSchema` each began emitting an info once the symbol below them
      went private. Fixed by **reordering, not suppressing** — private declarations now group ahead
      of the exported surface in both files (`extractServerActionFields` moved above `extractForm`;
      `DomainConflictMetadata` moved up beside its schema), which is the arrangement the rule wants
      and reads better anyway. **The lesson is the verification method, not the rule:** the two infos
      were introduced and shipped in the commit above because it was validated with
      `pnpm check:fast >/dev/null; echo $?` — and Biome **infos do not change the exit code**, the
      exact blindness the entry below this one is about. Verify a Biome slate by **listing
      diagnostics**, never by reading an exit code. `check:fast`, `knip`, `test:coverage` (floors
      hold) and unit 386/386 all green afterwards, with a zero-diagnostic Biome slate.
- [x] **Biome info slate back to 0 — the test override was anchored to `src/`** _(2026-08-06,
      `claude/what-is-next-6181ec`)_ — five `style` infos had accumulated (non-blocking, so
      `biome:lint` still exited 0 and they rode along unnoticed). **Three were not a code problem
      at all.** The override that turns `noMagicNumbers`/`noExcessiveLinesPerFunction`/
      `useTopLevelRegex` off in tests globbed `src/**/__tests__/**` + `src/**/*.{test,spec}.*`, so
      the four test files under `devtools/**` fell outside a decision that was already made for
      them — the same class of bug as the hardcoded deny path the day before: a rule written
      against a **location** instead of a **concept**, which fails silently when the concept moves.
      Widened to `**/__tests__/**` + `**/*.{test,spec}.{ts,tsx}` (kept `test-support/**`), so the
      gap cannot reopen when a test lands in a new directory. Verified by **probe rather than by
      reading globs**: a throwaway magic number in `devtools/shared/` still flags, the identical
      one under `devtools/shared/__tests__/` does not, and `useNumericSeparators` fires on **both**
      — proving the override relaxes only its three named rules and nothing leaked.
      The remaining two were real and fixed in `devtools/shared/deploy-identity.ts` (non-test code,
      where the rule legitimately applies): the `30` in `30 * SECONDS_PER_MINUTE` extracted to
      `DEPLOY_IN_FLIGHT_MINUTES` so the doc comment's "30 minutes" names a constant, and
      `useExportsLast` on `classifyFreshness` **suppressed, not obeyed** — the file deliberately
      leads with the pure decision and puts the I/O after it, so satisfying the rule meant burying
      it under ~80 lines of plumbing; suppression-with-a-reason follows the existing idiom in
      `table.atom.tsx`/`select-menu.atom.tsx`. `seed.guards.test.ts` was **not edited** (Andrew's
      call to leave it) — the glob widening cleared its info without touching the file.
      Checked and **not** a gap: `knip.json` carries the same `src/`-anchored shape, but knip's
      vitest plugin derives test entries from the vitest config, so devtools tests are already
      covered. Validation: Biome 0 diagnostics across 643 files, `check:fast` exit 0, unit 386/386.
- [x] **`db:seed` misleading exit 0 on a non-empty DB** _(2026-08-05, `claude/kind-fermi-454a6f`)_ —
      `databaseSeed()` returned early when the guard found data, so `runCli` printed "Database
      seeded successfully." and exited 0 right after the refusal notice — the misleading-exit-code
      genre again. Guard restructured to `assertDatabaseEmpty()`, which **throws** (mirroring
      `assertDestructiveDbTaskAllowed`: `runCli`'s catch → exit 1). The advertised `SEED_RESET=true`
      hatch was vestigial — `process.env.SEED_RESET` is read nowhere (export removed as unused back
      in `0d283653`) — so the message now names the real remedy (`pnpm db:reset:<env>` then reseed)
      instead of resurrecting the flag. Unit test pins the throw + remedy; e2e untouched (every
      caller resets first via `cy.dbResetAndSeed()`).
- [x] **De-hardcode the prod-env deny — `//**/` glob instead of a machine path** _(2026-08-05,
      `claude/deny-reach-portable`)_ — the deny-reach fix landed the day before pinned the primary
      checkout by absolute path: `Read(//Users/ap/WebstormProjects/nextjs-dashboard/.env.production.local)`.
      Three problems, all real: it guards **exactly one copy** (proved by probe — a
      `.env.production.local` at any other path read fine), it **silently stops matching** if the repo
      moves (no error, the rule just goes quiet — and this repo has been relocated before), and it
      publishes the machine layout in a public repo.
      Replaced with `Read(//**/.env.production.local)` — **the `//` absolute form accepts globs**, so
      it matches that filename anywhere on the filesystem: no machine path, survives relocation, and
      covers every clone rather than one. Verified by probe under isolation (only this rule active):
      dummy file outside the project root → denied; harmless sibling in the same directory → readable,
      so it is file-precise despite the error text saying "directory". Never probe the real prod env —
      a dummy, always; if the rule fails to match, a real probe pulls live credentials into context.
      **Verification gotcha found the hard way, now in the verify skill:** permission edits **stop
      hot-reloading after `EnterWorktree`** — a rule proven to deny minutes earlier silently stopped,
      and edits to neither the worktree's nor the primary's `settings.json` took effect. It produced
      three false "this pattern doesn't work" conclusions before the control test caught it. Probe deny
      rules from the primary checkout, then move the edit to the worktree branch to commit. Config is
      read at session start, so a fresh worktree session is unaffected.

- [x] **Env-file policy decision + `.gitignore` glob hardening** _(2026-08-05,
      `claude/review-audit-cleanup`)_ — Andrew's call: env values are **not secret from AI tools**;
      the binding goals are "never in git" (repo is **public**) and "never exposed to other
      people/services". Implemented: `.gitignore` now ignores `.env*` by **glob** with a
      `!.env.example.local` exception (it enumerated five filenames, so a future
      `.env.staging.local` was committable — verified fixed with `git check-ignore`);
      `settings.json` read-denies drop to `.env.production.local` only (dev/test env files are
      readable when a task needs them; all env **write** denies stay); `AGENTS.md` safety section
      rewritten to state the policy and the per-tool enforcement (aiignore still hides all env from
      JetBrains indexing — that's the third-party channel). This **resolves the audit's open
      `.aiignore`-vs-settings question** — the layers now diverge on purpose. Decided **against** a
      scheduled env-rotation routine: rotation guards exposure, not committing; GitHub secret
      scanning + push protection confirmed already enabled on the repo; rotate on suspected exposure
      only. The `/verify` question **resolved same-day**: it exists (a bundled runtime-verification
      skill — Andrew invoked it, and it drove this very branch's verification), so the guide now
      gives `/verify` its own row distinct from `/run` and the open-question note is gone. That
      verification run also exposed a **deny-reach gap**: a worktree session's `Read(**/…)` denies
      only match inside its own project root, so the primary checkout's `.env.production.local` was
      readable from a worktree — closed with an absolute-path deny entry, re-probed, now blocked
      (in-root deny matching confirmed working via a `.key` probe).

- [x] **Post-review hardening: `check` superset, deny variants, root-README sweep** _(2026-08-05,
      `claude/review-audit-cleanup`)_ — review of the parity branch verified every claim against
      code/runtime (including the live `47 21 * * 0` cron via the scheduler) and found one gap:
      **`pnpm check` skipped `db:drift`**, so the "full" gate was not a superset of `check:fast` —
      drift gate added to `check`. Extended the `|| r=1` no-short-circuit idiom to `md:check`/`md:fix`
      (an unfixable markdownlint error was silently skipping dprint — the same class `lint`/`fix`
      fixed at the top level); deleted the unused `cy:e2e:ci` alias (CI calls `cy:e2e` directly);
      added `Bash(pnpm run db:…*)` deny variants for the four guarded scripts and reworked
      `AGENTS.md`'s prefix-matching example so it stays true. **Root `README.md` swept** — the drift
      sweep covered `docs/` but not the root: Getting Started prescribed `SESSION_SECRET=change-me`,
      which the session service rejects at startup (<32 chars) — now points at `.env.example.local`
      as the contract; the Testing section gained the missing unit-lane entry and now mirrors the
      corrected e2e recipes (`pnpm e2e` one-shot; `serve:test` rebuilds, so the prescribed pre-build
      was thrown away; `cy:e2e:run` was labeled "CI-friendly" but CI uses `cy:e2e`); fixed `clean`'s
      scope and "Biome for JS/TS/JSON" (owns CSS too) here and in the scripts guide. `db:seed`'s
      silent-success-on-refusal wart spun off to its own session.

- [x] **Slash-command ↔ pnpm-script parity + repo-wide drift sweep** _(2026-08-05,
      `claude/claude-audit-cleanup`)_ — follow-up to the `.claude/` audit below. Established one
      rule: **`/X` runs `pnpm X`**, with `-` standing in for `:` (`/check-fast` → `pnpm check:fast`),
      and nothing may take the name of a script it does not run. `/check` broke it — it ran
      `check:fast`, a strictly weaker gate that runs **no tests at all**. Renamed `/check`→`/check-fast`
      and `/check-full`→`/check` (`git mv`, both bodies were already correct), and added four alias
      scripts — `lint`, `fix`, `coverage`, `e2e` — so every command is a thin wrapper and the `/lint`
      and `/fix` recipes stop living only in Markdown. `/ship` and `/clean-worktrees` are the two
      documented exemptions (workflows, no script). CI was never at risk: `ci.yml` calls individual
      scripts, never `pnpm check`.
      **`lint`/`fix` use `a || r=1; b || r=1; exit ${r:-0}`, not `&&`** — verified empirically that
      `biome check --write` exits 1 whenever unfixable diagnostics remain, so `&&` would have silently
      skipped the Markdown half on every run with a lint error. The idiom suppresses the short-circuit,
      not the exit code.
      **Drift sweep** (6-lens audit, 33 findings confirmed / 13 rejected): fixed `pnpm dev` in the bug
      template (no such script) and `pnpm biome:check` in the Result README; corrected `ci.yml`'s claim
      that `check:fast` covers unit tests (it runs none), its "there are no PRs" header (Dependabot
      opens them), and its 20→23 spec count; fixed `knip.md`'s claim that CI runs `check:fast`; fixed a
      cron self-contradiction in `weekly-maintenance-routine.md` (`0 9 * * 1` at the create step vs the
      live `47 21 * * 0`) plus its stale `pnpm@11.5.3` pin; corrected `db:reset:*` in the scripts guide
      (it **truncates** — it does not drop, recreate, or seed, so the "start fresh" workflow was
      starting on empty tables), the one-shot E2E recipe (`cy:e2e:run` boots no server), `clean`'s
      scope, and documented 10 previously-undocumented scripts; fixed `/ship`'s prescribed commit
      trailer (matched zero of the last 20 commits — the harness stamps a model-specific one); indexed
      the two docs missing from `docs/README.md`; and corrected `AGENTS.md`'s claim that Biome owns only
      JS/TS/JSON (it lints and formats CSS too).

- [x] **`.claude/` audit — delete the inert sandbox block, fix command drift** _(2026-08-05,
      `claude/claude-audit-cleanup`)_ — a full read of the 13 files under `.claude/` found the
      **`sandbox.filesystem.denyRead` block was not gating anything**: `wc -c` through Bash read
      `.env.production.local` at the _exact absolute path listed on line 81_. Related, and
      demonstrated in the same session: Bash denies match on the **command-string prefix**, so
      `printenv HOME` is denied while `env | grep '^HOME='` returns normally. The R2 refactor
      (2026-07-30) had deleted ~10 `Bash(cat/grep/… .env*)` patterns _because_ the sandbox was
      believed to be the real boundary — so the block was carrying weight it never had.
      **Deleted it** rather than leave a rule that invites false confidence; `AGENTS.md` now states
      plainly that `Read`/`Write` denies hold, Bash denies stop slips not paths, and the
      "don't read/print/commit `.env*.local`" rule is the actual contract.
      Also: dropped phantom `Bash(pnpm db:drop*)`/`db:wipe*` denies (no such scripts); corrected
      `/check` and `/check-full` descriptions (both omitted Markdown, `/check` also omitted
      `db:drift`, and `ship.md` already described the same script correctly); dropped `/lint`'s
      redundant `biome:format:check` (`biome check` covers formatting); documented the `/fix`
      write-lock in `fix.md` itself; added `$schema` to `settings.json` + `launch.json`; removed a
      stray `.DS_Store`. **Left open for Andrew:** `.aiignore` globs `.env*` while `settings.json`
      enumerates five filenames, so a future `.env.staging.local` would be ignored by JetBrains but
      not denied to Claude — unresolved because permission rules have no negation, so a glob would
      re-block the tracked `.env.example.local` contract (the exact bug R2 fixed).

- [x] **Deploy-identity check — closing the push→deploy blind spot** _(2026-08-05,
      `claude/routines-review-artifacts`)_ — a routine-coverage review found the four scheduled
      agents well-distributed but **the seam between "I pushed" and "the push worked" unwatched**,
      in two ways. (1) `ci.yml` triggers on `push: branches: [main]`, and since feature work merges
      locally there is **no PR anywhere showing a red X** — and `check:fast` runs no tests, so that
      CI run is the FIRST execution of unit/e2e/integration against the merged tree. (2) More
      subtly: **prod-watchdog could not detect a stale deploy.** Its landing check asserts
      `HERO_TAGLINE`, a stable constant the PREVIOUS build also contains — so when a Vercel build
      fails and the old deployment keeps serving, all five smoke checks pass against week-old code.
      The commit that added the watchdog claimed "bad rollback, stale build" was covered; it was
      not. Both docs and the routine prompt corrected.
      **Fix — liveness vs identity.** Every existing check was a liveness probe; liveness stays
      green through exactly this failure. Added `getDeployedCommitSha()`
      (`src/shared/core/config/server/deployment-identity.ts`, its own module because
      `VERCEL_GIT_COMMIT_SHA` is optional-by-nature and must not go through `ServerEnvSchema`, and
      because Biome's `noProcessEnv` is only relaxed in the config layer — the lint rule enforcing
      the architecture). `/api/health` now reports `commit` (absent, not null, off-platform, so a
      prober can tell "predates reporting" from "unknown"). New `deploy-freshness` check in
      `devtools/shared/deploy-identity.ts` compares it against remote `main`.
      **Two decisions worth keeping:** expected SHA comes from `git ls-remote`, NOT
      `rev-parse origin/main` — a stale tracking ref would make a stale deployment compare EQUAL, a
      false pass on the very failure being checked. And the check DEGRADES TO A WARNING when it
      cannot reach a verdict rather than failing. Routine also now reads `gh run list --branch main`
      (reports a single failure, escalates only on repeats or a coincident smoke failure).
      Validation: `check:fast` green, 4 new unit tests pass, live `smoke:prod` green with the
      expected "reports no commit" warning (prod predates the change), `/api/health` verified
      off-platform on the dev server. **In-flight window set to 30 min** (Andrew's call) — a
      mismatch inside it is a note, at or past it a failure; the decision was extracted into a pure
      `classifyFreshness` so the threshold and its boundary are pinned by tests rather than buried
      in the I/O path.

- [x] **Lighthouse regression routine + off-peak retiming of all four agents** _(2026-08-05,
      `claude/routine-setup-recommendations`)_ — closed the last gap from the recommendation pass and
      put a shared scheduling policy behind all of it. **New `lighthouse-regression` agent** (Sun
      20:19, spec `docs/lighthouse-regression-routine.md`): axe covers a11y continuously, but perf,
      SEO and best-practices had **no continuous check at all** — the only numbers on record were one
      manual run. Runs both presets via `pnpm dlx lighthouse@13` (deliberately NOT a project
      dependency — large, single consumer) against **Google Chrome Dev**, the only Chrome installed
      here. **Weekly, not monthly**, since a month-old number proves nothing about a repo that
      deploys often.
      **Two findings, both from running it before scheduling it.** (1) Lighthouse scores are only
      comparable **within a version**, and the category SET changes too — 13.4.1 reports an
      `agentic-browsing` category earlier runs did not have, so the routine version-stamps every
      report and a report without a version stamp is not evidence. (2) **The run-to-run noise is
      larger than it looks**: the first desktop sample on 13.4.1 read 98 and a second read 100, same
      version, unchanged code — `force-dynamic` cold starts move the number. So the baseline was set
      from the paired confirming run at **100/100/100/100 on both presets** (mobile FCP 1.0s / LCP
      1.3s / TBT 10ms; desktop 0.6s / 0.7s / 0ms), 98 is explicitly documented as not-a-regression,
      and the routine re-runs a failing preset before escalating. Escalates only on a11y/BP/SEO below
      100 or perf ≤95. Only outstanding opportunity Lighthouse names: ~28 KiB unused JS.
      **All four agents retimed off-peak and staggered** — none inside ~08:00–18:00 Central, none on
      the hour (the cron-stampede reasoning `codeql.yml` already follows), no two overlapping:
      prod-watchdog daily 06:11 (was 07:30), bot-pr-triage Tue/Fri 06:41 (was 09:00),
      lighthouse-regression Sun 20:19, weekly-maintenance Sun 21:47 (was Mon 09:00 — Sunday evening
      is strictly better, the PR is still waiting Monday morning and the machine is likelier to be
      on than at 5am).
      **Model/effort is NOT a per-routine setting** — the local scheduler exposes no such field
      (`create`/`update` have no model param; `SKILL.md` frontmatter is name + description only), so
      routines inherit the app's session model. `/schedule` **cloud** routines do accept
      `session_context.model`, but they run in Anthropic's cloud with no access to this machine's
      checkout, pnpm cache, `gh` auth or Chrome — which all four of these need. Cost is therefore
      controlled inside the prompts: each names its exact commands, forbids codebase exploration, and
      exits early on the common no-op. Policy documented once in `docs/README.md`, not restated per
      routine. Also corrected a standing docs inaccuracy: these are **local** scheduled agents, not
      "cloud agents" as `weekly-maintenance-routine.md` had claimed.

- [x] **Bot-PR triage routine** _(2026-08-05, `claude/routine-setup-recommendations`)_ — the second
      gap from the routine-recommendation pass. Under the local-first model human work merges with
      no PR, so the PR queue is **entirely bots** (Dependabot weekly + the weekly-maintenance Monday
      PR) and nothing in the daily workflow pulls attention to it. That has already cost work: #105
      sat until it was overtaken and closed as superseded by #107, and it is not isolated —
      **#113, #114, #116, #117, #119 and #122 were all closed rather than merged**, mostly because a
      manual upgrade or a later grouped PR overtook them while they waited. Now the `bot-pr-triage`
      `/schedule` agent (cron `0 9 * * 2,5`) classifies every open PR into one of six buckets —
      clean / superseded / release-age-blocked / needs-lockstep / failing / conflicted — with one
      recommended action each. Spec: `docs/bot-pr-triage-routine.md`.
      **Tue+Fri, not daily:** Dependabot is `interval: weekly` (Monday) and weekly-maintenance also
      lands Monday, so Tuesday triages a full queue one day old — by which point anything blocked on
      pnpm 11's ~24h `minimumReleaseAge` has cleared — and Friday sweeps before the weekend.
      **Superseded is verified, not guessed** (reads the version on `main` from `package.json` and
      compares against the PR target). **Release-age blocking is treated as the policy working**, not
      a defect — wait and rebase, never bypass. Standing holds encoded from prior incidents: Biome
      bumps checked for `panicked` (2.5.3 panicked on 8 files while exiting 0 — silent lint loss),
      `next` bumps held to `>= 16.2.12` for TS7, and `sharp` flagged because it is override-pinned.
      **It never merges, closes, approves, pushes or edits** — the merge decision stays the review
      gate; its one permitted write is a single `@dependabot rebase` comment on a PR whose release-age
      block has cleared. Also flags any PR open >14 days by name, and leaves human-authored PRs alone.
      Docs-only change in the repo (the agent itself lives in `~/.claude/scheduled-tasks/`).
      Housekeeping in the same pass: the orphaned `merge-dependabot-pr-36` scheduled-task directory
      was identified as residue (its PR merged 2026-06-09, already deregistered from the scheduler).

- [x] **Production watchdog routine** _(2026-08-05, `claude/routine-setup-recommendations`)_ — closed
      the one structural gap in this repo's guard coverage: every existing check (`check:fast`, the
      four CI jobs) is **event-driven off a commit** and proves the CODE, so nothing observed the
      **deployed artifact** afterwards. The failures that allows all happen without a push — Neon
      suspending the free-tier DB, a rotated Vercel env var, wiped seed data, a rollback serving an
      older build, or an auth path that breaks in production only. Now covered by
      `devtools/cli/prod-smoke.cli.ts` (`pnpm smoke:prod`) driven by the daily `prod-watchdog`
      `/schedule` agent (cron `30 7 * * *`); spec in `docs/prod-watchdog-routine.md`.
      **It asserts on a real logged-in session, not on 200s** — a site can return 200 on every page
      while login is broken, which is exactly what a read-only pinger reports as healthy. Checks:
      `/api/health` (200 + `db: "up"`), `/` (200 + hero tagline), **`/dashboard` with no session →
      307 to login** (the inverse guard — a watchdog that only proved pages render would pass just
      as happily if the dashboard were wide open), and seeded USER **and** ADMIN logins whose
      dashboards must render with a flight payload, ADMIN additionally asserting role-gated Users
      nav — so authorization is covered, not just authentication.
      **The load-bearing finding: a Server Action can be driven with no browser.** Its id is
      build-generated, but React renders server-action forms for progressive enhancement, so the id
      ships in the markup as `$ACTION_REF_<n>` / `$ACTION_<n>:0` / `$ACTION_<n>:1` / `$ACTION_KEY`
      hidden inputs; replaying those dispatches the action. That means the guard exercises the same
      **no-JS path** a real visitor would, with no Cypress and no browser — cheap enough to run
      daily. Extracted to `devtools/shared/server-action-form.ts`.
      **Cost drove the cadence.** `createDemoUserTxHelper` inserts a `demo_user_counters` row **and
      a permanent user** per demo-button click, and those users are visible on the admin Users page
      — which is itself part of the demo. So the daily check uses the **seeded** logins (public in
      the README, imported from `seed.users.ts` rather than copied, and writing zero rows), and the
      demo button gets a **Monday-only** `--demo` run (~52 rows/yr instead of ~365). Mondays also
      run `pnpm smoke:prod:csp` — the CSP guard always supported `CSP_GUARD_BASE_URL`, but nothing
      had ever pointed it at production; it passes there (6 documents, every script nonced).
      **A defect the negative test caught:** the first version threw on the first hard error, which
      discarded every finding already collected — backwards for a watchdog, whose value is the full
      picture. Each check now runs isolated (`SmokeReport.runCheck`) and a run against a wrong origin
      reports all five failures and exits 1. Latency is advisory below 12s (warn at 4s): cold starts
      are inherent to `force-dynamic`, measured 2.39s cold / 0.24–0.69s warm during this work.
      Also de-duplicated the production URL — it was a bare literal in `layout.tsx` and the README;
      now `PRODUCTION_SITE_URL` in `external-urls.ts`, consumed by `metadataBase` and the guard.
      Validation: `check:fast` green, unit 373/373, Biome slate 0, live run green.

- [x] **docs/ consolidation — one home per rule** _(2026-08-05, `claude/docs-consolidation`,
      [#128](https://github.com/andrewpetersondev/nextjs-dashboard/issues/128))_ — the last piece
      of the docs work: `docs/standards/` overlapped three older docs that predate it, with no
      stated winner, so a reader could follow either and get different answers. Resolved by giving
      each rule exactly one home and making every other mention a link.
      **Two docs deleted outright.** `when-to-use-app-error.md` (22 lines) held exactly one rule
      the standards didn't: _policy decision → return a domain outcome value; technical failure →
      `Err(AppError)`_. That rule was verified live before promoting it —
      `evaluateSessionLifecyclePolicy` really does return a decision carrying a
      `TerminateSessionReason` rather than an `Err` — and now sits in
      `standards/error-handling-and-result-pattern.md` under Failure Classification. The rest of
      the file was tentative note-to-self prose ("you don't have to do that now"), not a standard.
      `ui-refactor-strategy.md` (330 lines) was a **2026-04 migration plan with durable placement
      rules mixed in**. The durable half moved into `project-structure.md` as a new "Placing a
      component (TSX)" section; the plan half was dropped as spent, and it was measurably stale —
      its target taxonomy listed `presentation/templates|adapters|view-models` folders that exist
      in **no** module, and `src/shell/dashboard/frames/` which does not exist, while its one
      concrete migration ask (`src/ui/layouts/` → `wrappers/`) was **already done**. All five of
      its named reference files were checked and still exist, so those carried over. It also
      contained the same 4-step decision tree **twice** ("Placement Checklist" and "Decision
      Framework"); the merged version states it once.
      **The authority split is now written down** in `docs/README.md` and echoed as a scope note in
      each doc: top-level directory → `project-structure.md`; layer inside a module →
      `clean-architecture-standards.md`; what it's called →
      `naming-conventions-and-organization.md`; how failures are modeled →
      `error-handling-and-result-pattern.md`. Under that split two sections were **in the wrong
      file** and moved: `global-standards.md`'s "Server Action Responsibilities" and its
      `@/server/**` import allowlist are layer rules, so they now live in
      `clean-architecture-standards.md` beside the other layer rules. Three duplicate copies were
      reduced to pointers (global-standards' "Project Structure" list, clean-architecture's
      "Screaming Architecture" folder stub), and `project-structure.md` lost its generic
      §2 "Map concerns to layers" — boilerplate naming models (`Account`, `Transaction`) this repo
      has never had, which also contradicted its own import-boundary section by putting server
      actions in Infrastructure. Inbound links repointed: `docs/README.md` plus the `customers`,
      `invoices`, and `users` module READMEs. Every relative link in the eight touched files was
      resolved against the filesystem; no dangling references remain. Validation: `check:fast`
      green (markdownlint + dprint included), unit 373/373.
- [x] **Forms taxonomy flattening** _(2026-08-05, `claude/next-steps-600eb9`,
      [#129](https://github.com/andrewpetersondev/nextjs-dashboard/issues/129))_ — the last
      open piece of the shrink → lock → decide → reshape roadmap, whose other three steps
      finished 2026-06-13. `src/shared/forms/` carried **two** classification axes: the
      layer (`core`/`logic`/`presentation`/`server`) and the kind (`types/`, `guards/`,
      `factories/`, `inspectors/`, `mappers/`, `utils/`). The kind axis was pure
      restatement — every filename already ends in `.types`/`.dto`/`.guard`/`.factory`/
      `.inspector`/`.mapper`/`.utils` — and five of those nine subdirectories held exactly
      one file. **Dropped the kind axis, kept the layer axis**: 13 directories → 4, and
      each layer is now flat. The layer stayed because it is the only one encoding a real
      constraint (`server/` must never be reachable from a client component), and because
      it matches the closest sibling module, `src/shared/http/` (`core/` + `server/`, flat
      within each). 19 files moved via `git mv`; **0 lines of logic changed** — the whole
      diff is paths. Imports were uniform (every file, including the module's own, used the
      `@/shared/forms/**` alias — no relative intra-module imports to fix), so the rewrite
      was one scoped regex over the 66 files that referenced the old paths, verified by
      re-counting: 141 import sites before, the same 141 after, redistributed exactly as
      expected. Docs reconciled: both module READMEs (the notes README's directory tree was
      the only place the kind axis was documented), the four `docs/diagrams/error-handling-flow.md`
      links, and `docs/lane-map.md`'s backlog table — **which was stale by five rows**, still
      listing invoice amount-cap, session ceiling, rootfiles, Cypress typecheck, and
      integration CI as open; refreshed to the four genuinely-open items. Validation:
      typecheck (app + Cypress) green, unit 373/373, Biome slate 0, `check:fast` green.
      Full e2e not run locally — this sandbox can't reach `fonts.gstatic.com`, so `next dev`
      500s at boot; CI is the first real e2e proof, and the change is import-path-only.
- [x] **Cypress standalone typecheck lane** _(2026-08-04, `claude/issue-127-0f4b0d`,
      [#127](https://github.com/andrewpetersondev/nextjs-dashboard/issues/127))_ — the
      Cypress sources sit outside the `tsc -b` graph and had no `tsc` pass at all; type
      errors surfaced only in-editor and at spec webpack-compile time. Fixed by
      **splitting the config**, the first of the two routes the issue named:
      `cypress/tsconfig.typecheck.json` now holds the real configuration **without**
      `baseUrl` (which TS7 removed and now errors on, TS5102), and `cypress/tsconfig.json`
      is a shim that extends it and adds `baseUrl` back. Nothing else moved, so the
      hard-won preprocessor wiring is untouched.
      **The premise was verified, not assumed**: dropping `baseUrl` outright was
      probed against the real resolver and **would have broken spec bundling** —
      `tsconfig-paths@4` computes `absoluteBaseUrl` as `dirname(tsconfig) + (baseUrl ?? "")`,
      so without it the inherited `paths` rebase onto `cypress/` and `@cypress/e2e/shared/urls`
      stops resolving. The shim's resolved output was then confirmed byte-identical to the
      old single file's. Wired in via `pnpm typecheck` (now `typecheck:app` +
      `typecheck:cypress`), so it runs in `check`, `check:fast`, **and** the CI
      `Lint & type-check` job — the "wired into no pipeline" flaw that killed the last
      script. **The pass immediately found a real error** it was meant to catch:
      `A11Y_INCLUDED_IMPACTS` was typed `ImpactValue[]`, which includes `null`, against
      cypress-axe's `includedImpacts?: string[]` — now `NonNullable<ImpactValue>[]`.
      Costs ~0.5s.
- [x] **Integration lane in CI** _(2026-08-04, `claude/integration-ci`,
      [#130](https://github.com/andrewpetersondev/nextjs-dashboard/issues/130))_ — the
      5 integration test files (21 tests, all auth's sharpest paths: session rotation,
      login/signup flows, error propagation, repository final gate) ran on developer
      machines and **nowhere else**, so a break in them reached `main` unnoticed unless
      e2e happened to catch the same path downstream. Now a fourth CI job,
      `Integration (Vitest)`, reusing the e2e job's proven `postgres:17-alpine` service
      container. **Deliberately a separate job, not a step inside `e2e`:** these need a
      database but no browser and no server, so the lane finishes in ~2s of test time
      instead of waiting on Cypress. Added as a NEW job — never a rename, since
      required-status-check contexts pin job NAMES. **No seed step**, unlike e2e: the
      tests create and delete their own rows by email/id, reference no seeded demo
      account, and touch neither customers nor invoices. **That claim was verified the
      hard way rather than assumed** — the first local run passed against a `test_db`
      that already held 6 users and 6 customers from prior e2e runs, which proved
      nothing about CI's empty container, so a scratch `ci_sim_db` was created,
      migrated, confirmed empty, and the suite re-run green (21/21) against it. Also
      confirmed the lane is genuinely DB-backed (11 of 21 fail with no database, so the
      service container is load-bearing rather than decorative). `CYPRESS_INSTALL_BINARY=0`
      on the install step: `allowBuilds: cypress` lets the postinstall download a browser
      binary this lane never opens, and unlike `e2e` there is no binary cache here.
      Docs reconciled, including **drift that predated this change**: `ci.yml`'s header
      said the integration lane was "intentionally NOT here", and both
      `docs/branching-and-releases.md` and `docs/diagrams/branch-and-ci-flow.md` still
      said **two** CI jobs — they had never been updated when the CSP guard landed
      2026-08-03, so they were wrong by one before this made them wrong by two.
- [x] **The four deferred tooling calls from the root-file audit** _(2026-08-04,
      `claude/next-steps`, [#125](https://github.com/andrewpetersondev/nextjs-dashboard/issues/125))_ —
      all four decided on evidence rather than taste; full rationale in the new
      [`docs/biome.md`](docs/biome.md) and in `docs/knip.md`.
      **(1) Cypress CI retries → stay 0, but now explicit** in `cypress.config.ts` with the
      reasoning inline: a flake must fail loudly, like every other guard here (CSP,
      prod-DB, blocking axe). It was previously 0 only by omission — a default nobody
      chose. **(2) The five Biome rules → two enabled, three documented.** Each was
      trial-run whole-repo with `biome check --only=<rule>`: `noUndeclaredDependencies`
      **227 findings, all false** (it reads TS path aliases — `@database/*`, `@cypress/*`,
      `@devtools/*`, `@test-support/*` — as scoped npm packages); `noUnresolvedImports`
      **4, all false** (`cypress` and `react`, both installed and tsc-clean);
      `useImportExtensions` **1977** (wrong model — bundler-resolved imports). Those three
      stay off **with the counts recorded**. `noInferrableTypes` and `useConsistentArrayType`
      are now **on**: 22 findings, all auto-fixed in the same change (11 were
      `ReadonlyArray<T>` → `readonly T[]`, needing `--unsafe`, scoped via `--only`).
      **(3) The interactive Cypress PORT-guard gap → closed.** `cy:open`/`cy:run` attached
      to a running server with **no identity preflight**, so a dev server holding the port
      meant the seeded, destructive specs ran against the **development** database. Both
      now run `cy:preflight` first; `e2e-preflight.cli.ts` gained an env fallback that
      derives the URL from `PORT` exactly as `CYPRESS_BASE_URL` does, so a stale exported
      `PORT` sends both to the same server instead of hiding the mismatch. Verified: the
      guard exits 1 and Cypress never launches. **(4) Knip CSS hint → explicitly retired**
      — the repo has exactly one CSS file (`src/app/globals.css`, imported by the root
      layout), so widening the globs would check one obviously-live file. Revisit if CSS
      Modules or per-route stylesheets appear. **Two gotchas worth keeping:**
      `biome.json` **cannot hold comments** (the config loader fails the whole run —
      verified), which is why the rationale needed its own doc; and filtering a Biome trial
      for `Found N errors` **misses `Found N infos`** — that mistake made both enabled
      rules look like they had zero findings when they had 22. Also fixed real drift found
      en route: `cypress/README.md` claimed `pnpm cy:open` boots a server, which it never
      did. Validation: Biome slate 0, unit 373/373, typecheck + `check:fast` green. **Full
      e2e not run here** — this sandbox can't reach `fonts.gstatic.com`, so `next dev`
      500s at boot and `wait-on` times out; unrelated to the change, but it means CI (or a
      local run) is the first real e2e proof.
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
