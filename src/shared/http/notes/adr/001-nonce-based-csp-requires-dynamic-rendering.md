# ADR 001: A Nonce-Based CSP, at the Cost of Static Rendering

## Status

Accepted (2026-08-03)

## Context

The app shipped no security headers at all: no Content-Security-Policy, no
`X-Frame-Options`, no `X-Content-Type-Options`, no `Referrer-Policy`, no HSTS.
`poweredByHeader: false` was the only hardening in the repo.

The five request-independent headers are uncontroversial and ship from
`next.config.ts`'s `headers()`. The CSP is not, because of a genuine conflict
between two things the App Router does:

1. A **strict CSP** — the form Google and OWASP both recommend — is
   `script-src 'nonce-{random}' 'strict-dynamic'`. The nonce must be fresh per
   response; a reused nonce is equivalent to `'unsafe-inline'`.
2. A **statically prerendered page** is generated at build time. It cannot carry
   a per-request value, so it ships with no nonce at all.

Under `'strict-dynamic'` browsers also **ignore** the `'self'` fallback in
`script-src`. So a prerendered page under this policy has every script blocked.
Five documents were prerendered here: `/`, the three `/auth/*` pages, and
`/_not-found`.

The failure is silent, which is what makes it dangerous. The server-rendered DOM
is complete and visually correct, so the page **looks** fine — in a browser, in a
screenshot, to a reviewer. But `self.__next_f` is only ever defined from inside
the blocked inline scripts, so the RSC payload never arrives, React never mounts,
no error boundary fires, and no hydration-mismatch warning is emitted. The page
is inert.

## Decision

Ship the strict policy and make the app dynamic.

`export const dynamic = "force-dynamic"` on the **root layout**
([`src/app/layout.tsx`](../../../../app/layout.tsx)) — not per-route, and not a
side-effecting `await connection()` call. Per-route config cannot reach
`/_not-found` (there was no `not-found.tsx` to hold it), and a bare side-effect
statement in a layout fails silently the day someone deletes it, which is the
exact failure class this decision exists to remove. `export const dynamic` is
declarative and greppable.

Production policy:

```text
default-src 'self'; script-src 'self' 'nonce-<b64>' 'strict-dynamic';
style-src 'self'; img-src 'self' blob: data:; font-src 'self';
connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self';
frame-ancestors 'none'; upgrade-insecure-requests
```

Development additionally allows `'unsafe-eval'` in `script-src` (React Fast
Refresh) and `'unsafe-inline'` in `style-src` (Next injects stylesheets inline in
dev). The gate is `NODE_ENV === "development"` only — deliberately narrower than
"not production", so a `test` runtime can never exercise a policy production does
not serve.

Notes on two directives:

- **`base-uri 'none'`** rather than `'self'`. The app renders no `<base>`
  element, so `'none'` costs nothing and removes a same-origin `<base href>`
  primitive that would silently repoint every relative script URL. (An earlier
  draft justified this by claiming Google's CSP Evaluator flags a weak
  `base-uri` when nonces are present. That is **wrong** — the check fires only
  when the directive is missing, and its own text blesses `'self'`. The change
  stands; the citation does not.)
- **`style-src 'self'` carries no nonce**, unlike the Next documentation
  example. The app emits no inline styles of its own, and Next does not nonce
  the `<style>` blocks in its internal error pages — which is why this repo owns
  [`src/app/not-found.tsx`](../../../../app/not-found.tsx).

## Alternatives rejected

| Option                                                       | Why not                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `script-src 'self'`, keep pages static                       | **Does not work.** `'self'` is a URL source expression and never authorizes inline script content. App Router emits inline flight-data scripts on every page (13 in the prerendered `/`, 8 in `/auth/login`, 7 in `/_not-found`). There is no cheap middle path.                                                                                                                                                                                                                                       |
| `script-src 'self' 'unsafe-inline'`, keep pages static       | Works, but is a real downgrade, not a mild one. This app has **zero** legitimate inline scripts of its own, so `'unsafe-inline'` would authorize precisely and only the attack class the policy exists to stop. Google's CSP Evaluator rates it `[HIGH]`.                                                                                                                                                                                                                                              |
| Split policies — strict on dynamic routes, relaxed on static | Fails on a spec reason before maintainability: a nonce source makes browsers ignore `'unsafe-inline'`, so no single header serves both, and the proxy would need a hardcoded static-path list. The App Router _infers_ staticness, so any future `cookies()`/`searchParams` read flips a route while the path→policy map silently does not follow. It also puts the weak policy on the credential-handling auth forms.                                                                                 |
| `Content-Security-Policy-Report-Only`                        | Enforces nothing, and does not make a prerendered page hydrate. Both web.dev and OWASP frame it as a pre-deployment step, never an end state.                                                                                                                                                                                                                                                                                                                                                          |
| Post-build hash-based CSP                                    | Inline flight payloads embed content-hashed chunk names and per-route RSC data, so every hash changes every build, and `headers()` is evaluated before the HTML exists.                                                                                                                                                                                                                                                                                                                                |
| `experimental.sri`                                           | **The Next.js documentation is wrong about this.** It presents SRI as a way to "maintain static generation while still having a strict CSP" beside a `script-src 'self'` example. Verified false three ways: reading `required-scripts.js`, and two enable-and-rebuild runs producing `integrity` on 8 external chunks with every inline flight script still bare and zero nonces. `integrity` attaches only to file-URL scripts. Following that doc section top-to-bottom ships a silently dead page. |
| Platform-level (Vercel) nonce injection                      | No such product on any plan. Headers come from `next.config.ts` or `vercel.json` as static strings, and middleware cannot rewrite a response body.                                                                                                                                                                                                                                                                                                                                                     |

## Consequences

### Positive

- A genuinely strict CSP — the nonce + `'strict-dynamic'` form, with
  `object-src 'none'`, `base-uri 'none'` and `frame-ancestors 'none'`.
- `frame-ancestors`, `form-action` and `base-uri` close clickjacking, form
  hijacking and base-tag injection independently of the script directives.
- The proxy matcher hole found along the way is closed: it excluded paths by
  file extension, and Next answers `/nope.js` with a full `text/html` 404, so
  those documents were shipping with no CSP at all. Exclusions are prefix-only
  now, and the guard probes `/nope.js` specifically so it cannot rot back.

### Negative — accepted knowingly

- **No page in this app may ever be statically prerendered again** while this
  CSP is enforced, and CI fails in red if one is. A future `/about` or `/blog`
  is the likely trigger. The escape hatch is to move `dynamic` off the root
  layout onto the segments that need it — and knowingly accept that this
  becomes fail-open.
- Five documents lose build-time prerendering and edge-cached HTML;
  `Cache-Control` flips from `s-maxage=31536000` to `no-store`. `/` fetches no
  data, so the render itself is free and cold start dominates. **The cold TTFB
  on production `/` is unmeasured** — the one number this decision's
  first-impression cost hangs on. Measure it after deploy.
- **Cache Components / PPR are off the table** for now: Next documents PPR as
  incompatible with nonce-based CSP (`vercel/next.js#89754`, open).
- `next/image` emits `style="color:transparent"` unconditionally at five
  dashboard call sites, which `style-src` blocks. Bounded and cosmetic: no call
  site passes `fill` or a custom style, so the only blocked declaration hides
  avatar alt text while an image loads. Weakening a directive permanently for
  that is the wrong trade. `style-src-attr 'unsafe-hashes'` of that one
  declaration is the precise fix if it ever matters.
- `/_global-error` remains prerendered under every mechanism tested —
  `global-error.tsx` replaces the root layout and sits outside its segment
  config. It will serve un-hydrated and unstyled. Acceptable for a last-resort
  page, unacceptable to discover by accident.
- No CSP violation reporting: `report-to` needs a collector the Hobby plan does
  not provide. The build-time guard substitutes, which is the right trade at
  zero traffic.

### The guard

[`devtools/cli/csp-guard.cli.ts`](../../../../../devtools/cli/csp-guard.cli.ts)
(`pnpm csp:guard:build`) boots `next start` and asserts, per document across
six paths: a CSP header exists; the policy contains `'strict-dynamic'`,
`object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`,
`form-action 'self'` and neither `'unsafe-inline'` nor `'unsafe-eval'`; the
nonce matches Next's own extractor regex; **every** `<script>` carries it;
`self.__next_f` shipped; there are no inline styles; and no nonce is reused.

It runs in its own CI job. The existing `check` job runs no build, and
**Cypress cannot substitute**: it strips the CSP header by default
(`experimentalCspAllowList` is unset) and runs against `next dev`, which never
prerenders — so a green e2e suite is not evidence about CSP.

A malformed nonce is dropped **silently** by design — Next's
`get-script-nonce-from-header.js` applies `/^'nonce-([A-Za-z0-9+/_-]+={0,2})'$/`
and its comment says an invalid nonce is ignored "so the request can continue
without a nonce instead of failing". That is why the guard asserts on the
regex and on per-tag nonces rather than on console output.

## Follow-ups

- Measure cold and warm TTFB on production `/` and record both here.
- `require-trusted-types-for 'script'` on a Report-Only header, once there is a
  collector and it has been validated against Next 16 + React 19.
- Before moving to a custom domain, confirm every subdomain of the apex serves
  HTTPS or drop `includeSubDomains` from HSTS. On `*.vercel.app` the header is
  inert; on an apex you own it is a two-year, non-revocable commitment.
