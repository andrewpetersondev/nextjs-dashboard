Here’s a **refactored replacement** for your `scratch_5.md` content, updated to match the strategy we aligned on (keep Server Actions inside the module, make workflows explicit, elevate session lifecycle, and add a Result-first refactor track).

# Auth Refactor Strategy (Updated)

This module already has a **strong, intentional architecture**. The goal is not to “rewrite auth” — it’s to **reduce naming ambiguity**, **make orchestration obvious**, and **tighten consistency around failures (Result-first)** so the module stays easy to change as it grows.

This plan is designed to be **incremental** (low risk, high leverage).

---

## High-level diagnosis (what’s true today)

You’re already doing a hexagonal / clean-ish split:

- **Domain**: schemas/types/guards
- **Application**: services + orchestration
- **Infrastructure**: DAL, persistence, session transport
- **UI**: forms/components
- **Server Actions**: boundaries/adapters

The main issues are about **signal vs noise**:

1. “Action” is overloaded (Next.js boundary vs orchestration vs “do something”)
2. Auth flows exist, but the “story” is spread across multiple files
3. Session concerns are partly domain-ish and partly infrastructure-ish
4. Failure semantics can drift unless they’re made explicit and consistent

---

## Guiding principles (non-negotiables)

1. **One file = one intent**
2. **“Action” means one thing: Next.js boundary**
3. **Workflows tell the story** (multi-step orchestration)
4. **Use-cases are verbs** (single capability)
5. **Session lifecycle is first-class**
6. **Domain does not know how sessions are stored**
7. **Result-first**:
   - expected failures are values (`Result`)
   - unexpected failures are exceptions
   - unwrap `Result` only at boundaries (actions/routes)

---

## The new strategy (what changes)

### 1) Make “Action” exclusively mean “Next.js Server Action”

**Do not move Server Actions into `src/app/...` by default.**

Keeping actions inside `@/modules/auth` avoids coupling auth logic to routing conventions and makes it easier to reuse from:

- API routes
- background jobs
- tests/harnesses
- future entry points

**Rule:** actions are thin boundaries:

- parse/validate inputs
- call workflow/use-case
- unwrap `Result`
- translate to HTTP/UI outcome

---

### 2) Introduce explicit workflows for orchestration (“story files”)

Workflows are the place where you compose:

- user authentication
- session creation/refresh/invalidation
- policy checks
- cross-port orchestration

**Example naming:**

- `login.workflow.ts`
- `signup.workflow.ts`
- `refresh-session.workflow.ts`
- `verify-session-optimistic.workflow.ts`

**Benefit:**

- flows read like narratives
- easy to test without Next.js action plumbing
- makes boundaries and dependencies obvious

---

### 3) Keep use-cases small and verb-shaped

Use-cases should be narrowly scoped operations that can be reused by workflows.

Examples:

- `authenticate-user.use-case.ts`
- `create-user.use-case.ts`
- `create-demo-user.use-case.ts`
- `issue-session.use-case.ts`
- `refresh-session.use-case.ts`
- `invalidate-session.use-case.ts`

**Rule of thumb:**

- **use-case** = single capability
- **workflow** = composes multiple capabilities/ports

---

### 4) Promote Session into a first-class bounded area (domain + infra split)

Sessions are a lifecycle, not a detail. Give them a clear home.

**Domain session area includes only:**

- types
- schemas/codecs
- policies (expiry, refresh threshold, absolute lifetime rules)
- error definitions (as values)

**Infrastructure session area includes:**

- cookie mechanics
- token/JWT encryption/decryption
- adapter implementations of session ports

This keeps “what a session means” separate from “how it’s persisted/transported”.

---

### 5) Result-first refactor track (the real long-term win)

Folder reshuffles help readability, but the most important consistency win is failure semantics.

**Target behavior:**

- DAL + repositories return `Result` for expected failures
  - not found
  - already exists / uniqueness
  - validation issues
  - policy violations
- DAL/repositories **do not throw** for expected failures
- Only throw for:
  - broken invariants
  - programmer errors
  - impossible states

**Application services/workflows:**

- compose/map `Result`s
- translate low-level outcomes into domain/app error codes via factories

**Boundaries (Server Actions / Routes):**

- unwrap `Result`
- translate into redirects / HTTP responses / UI messages

---

## Proposed target shape (inside `@/modules/auth`)

This is intentionally close to what you have, just clearer:

- **domain**: pure rules/types/schemas
- **server/actions**: Next.js boundaries only
- **application**: orchestration (use-cases/workflows/services) + ports
- **infrastructure**: DB + session transport implementations
- **ui**: components/forms/features

```

src/
  modules/
    auth/
      domain/
        user/
        session/
      server/
        actions/               # Next.js server actions only (thin boundaries)
        application/
          use-cases/           # single-purpose verbs
          workflows/           # multi-step "stories"
          services/            # orchestration helpers built on ports
          ports/               # interfaces required by application
          observability/       # logging helpers (not domain)
        infrastructure/
          persistence/         # repositories + DAL
            dal/
          session/             # cookie/JWT adapters implementing ports
      ui/

```

Notes:

- Keep imports stable where possible; change structure gradually.
- Avoid barrel files; explicit imports remain clearer in a refactor like this.

---

## Migration plan (low-risk, incremental)

1. **Naming rule enforcement**
   - “action” == Next.js boundary only
   - introduce “workflow” for orchestration

2. **Pick one flow (recommend: login)**
   - create a `login.workflow.ts`
   - make the existing server action call the workflow
   - keep behavior identical

3. **Extract session domain area**
   - move session schemas/types/policies into `domain/session`
   - keep cookie/jwt in infrastructure

4. **Result-first normalization**
   - adjust DAL/repository boundaries to return `Result` for expected failures
   - keep exceptions for unexpected/invariants

5. **Repeat flow-by-flow**
   - signup, demo user, verify optimistic, refresh, logout

6. **Only then do “nice-to-have” folder renames**
   - e.g., `repository` → `persistence` if it still improves clarity

---

## Final verdict

This refactor is worth doing because it:

- reduces naming ambiguity (“action”)
- makes auth flows readable (“workflows”)
- prevents session complexity from leaking everywhere
- enforces Result-first consistency (the hardest part to keep tidy over time)

It’s also intentionally **non-destructive**: you can ship it step-by-step without breaking the world.

If you want, I can also produce a **short checklist version** to paste at the top of `src/modules/auth/server/` as a “contribution guide” for future work (naming + boundaries + Result-first rules).
