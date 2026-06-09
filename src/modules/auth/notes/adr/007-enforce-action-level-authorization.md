# ADR 007: Enforce Authorization at the Server-Action Level

## Status

Accepted

## Context

Route protection lives in the edge middleware (`src/proxy.ts`): it classifies
each path as public / protected / admin and redirects unauthorized requests
before a page renders (see the
[route-authorization diagram](../../../../../docs/diagrams/route-authorization.md)).

But Next.js Server Actions are **independently invocable RPC endpoints**. A
crafted request can reach an action without navigating through the page that
hosts it, so the route-level checks are not sufficient on their own. Without an
action-level check, a signed-in non-admin could replay a user-management action
(create / update / delete, or a user read) against a route they can reach and
escalate privileges — or read user PII directly.

## Decision

Each sensitive server action enforces its own authorization, as a second layer
beneath the route gate (defense in depth). Two guards live in
[`session/guards/session-access.guard.ts`](../../presentation/session/guards/session-access.guard.ts):

- **`requireSession()`** — requires any valid session; redirects to login when
  none exists. Used by the invoice mutations (create / update / delete).
- **`requireAdmin()`** — requires an admin session; redirects to login when
  unauthenticated and to the dashboard root when authenticated without the admin
  role. Used by every user action — create / update / delete **and** the user
  reads (which expose PII). The `delete-user-form` wrapper inherits the guard by
  delegating to the guarded core action.

Two supporting choices:

- **Reuse the optimistic check.** Both guards call `verifySessionOptimistic()`,
  the canonical session check, so there is one source of truth for "is there a
  session." It is wrapped in React `cache`, so repeated guard calls within a
  single request collapse to one verification.
- **Redirect, don't `forbidden()`.** A denied guard `redirect()`s rather than
  rendering Next's `forbidden()` / `unauthorized()`, matching the existing
  convention (`verifySessionOptimistic` already redirects to login; there are no
  `forbidden.tsx` / `unauthorized.tsx` pages). `authInterrupts` is enabled in
  `next.config.ts`, so switching to a real `403` is a clean future upgrade.

Guards are placed **above** each action's `try/catch`, so the `NEXT_REDIRECT`
control-flow error a guard throws propagates to Next instead of being swallowed
by the catch and reported as a generic error.

Customer reads and invoice reads are deliberately **not** guarded at the action
level: they are lower-sensitivity and remain behind the route middleware.

## Consequences

### Positive

- **Closes a privilege-escalation / PII-read gap** — role-restricted operations
  are enforced at the action, the real boundary, not just at the page.
- **Single source of truth** — guards reuse the one optimistic session check, so
  there is no parallel auth logic to drift out of sync.
- **Composable** — authorization is a one-line guard call at the top of an
  action; form wrappers inherit it by delegating to the guarded core action.

### Negative

- **Per-action discipline** — a new sensitive action must remember to add the
  right guard; nothing yet fails the build if it forgets.
- **Redirect, not 403** — a denied non-admin is bounced to the dashboard rather
  than shown an explicit "forbidden" page (acceptable until `forbidden()` is
  adopted).
