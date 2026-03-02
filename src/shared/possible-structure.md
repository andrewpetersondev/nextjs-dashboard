## ✅ Great — then make `shared/**/server/**` a *first-class sub-boundary*

If `shared/` may contain server-only code, the “professional” organization move is to make that rule **explicit,
consistent, and easy to audit**:

- **Universal code** lives anywhere in `shared/**` *except* `shared/**/server/**`
- **Server-only code** in shared must live **only** under `shared/**/server/**`
- Every `shared/**/server/**` file must have `import "server-only";`

That gives you a clean mental model and prevents “server-only creep” into universal shared code.

---

## 1) Folder conventions that scale

### A. Standard top-level `shared/` capabilities (you already have good ones)

Keep capability-based folders (nouns), and avoid “misc” buckets:

```plain text
src/shared/
  core/          # Result, errors, branding, shared config schemas
  forms/         # universal form types/logic + server-only form helpers under forms/server
  http/          # universal HTTP helpers (no next/headers)
  primitives/    # branded primitives + factories/mappers
  routes/        # route constants + path utilities
  telemetry/     # logging contracts + pure mappers/redaction; server wiring under telemetry/server if needed
  time/          # time helpers
  utilities/     # small generic helpers (array/enums/etc.)
  validation/    # zod schemas + normalization + policies
```

### B. Inside each capability, use **the same internal lanes**

This is the “professional consistency” trick—every shared capability can optionally have:

```plain text
<capability>/
  core/          # types/contracts that define the public surface of that capability
  logic/         # pure functions (no runtime dependencies)
  infrastructure/# integrations that are still universal (e.g. fetch wrapper) — optional
  server/        # server-only glue, adapters, factories (import "server-only")
  README.md      # optional: invariants + import rules + examples
```

Not every folder needs all of these. The point is: **when it exists, it means the same thing everywhere**.

---

## 2) The key rule: “server-only belongs in `server/` lane, not mixed”

To keep `shared/` clean long-term, adopt these two hard rules:

1. **No `import "server-only"` outside** `shared/**/server/**` and `src/server/**`.
2. **No Next server runtime imports** (like `next/headers`) outside `shared/**/server/**` and `src/server/**`.

This makes your boundary mechanically checkable (even by simple search).

---

## 3) A concrete target structure for your repo (minimal churn)

Based on your current top-level `shared` folders, here’s a clean target that matches your “shared can be server-only in
subfolders” preference:

```plain text
src/shared/
  core/
    branding/
    config/
      public/            # env-public-ish (universal)
      shared/            # env-shared-ish (universal)
      schemas/           # zod env schemas (universal)
      server/            # server-only env helpers if you ever colocate them here
    errors/
      core/              # AppError model, metadata, factories (universal)
      server/
        adapters/
          dal/
          postgres/
    result/              # (optional rename from results/)
  forms/
    core/
    logic/
    presentation/        # still universal (React-safe) if it is client-safe
    server/              # validate-form, zod error mapping, etc.
  http/
    core/                # header constants, url helpers
    server/              # request metadata from Next headers (if you want it here)
  telemetry/
    core/                # contracts, DTOs (universal)
    logging/
      core/
      infrastructure/    # logger implementation if it’s universal-safe
      server/            # sinks/wiring that are server-only (optional)
  primitives/
  routes/
  time/
  utilities/
  validation/
```

**Why this works:** it keeps your existing taxonomy, but introduces a predictable “server lane” within each capability.

---

## 4) Where should “shared but server-only” things go?

Use this decision matrix:

### Put it in `src/server/**` when…

- It’s a **global singleton** or platform resource (DB connection, connection pool, secret management, event bus
  instance)
- It’s broadly used and operationally sensitive (crypto, cookies, sessions)
- It’s infrastructure that feels like “the app’s backend platform”

### Put it in `src/shared/**/server/**` when…

- It’s **part of a shared capability** and tightly coupled to it
    - Example: `shared/forms/server/*` (server-side validation helpers for the forms system)
    - Example: `shared/core/errors/server/adapters/*` (server adapters for error normalization)
- It’s server-only *but not a singleton platform service*, more like “server-side helpers for this library”

A good heuristic:  
If it has a **stable, reusable, library-like API**, `shared/**/server/**` is fine.  
If it’s a **platform resource** (db, event bus instance), prefer `src/server/**`.

---

## 5) Naming rules that keep things professional

- Avoid `common/`, `misc/`, `helpers/` mega-folders at top-level.
- Prefer “what it is” over “how it’s used”:
    - `adapters/`, `mappers/`, `factories/`, `schemas/`, `contracts/`, `policies/`
- Keep server-only folders literally named `server/` (not `node/`, not `backend/`) so people instantly understand the
  boundary.

---

## 6) Tiny process rule that prevents `shared/` becoming a dumping ground

When adding something to `shared/`, require answering **one** question in the PR description:

> “Is this *cross-cutting* (3+ modules) and *stable* enough to be shared, or is it feature-domain logic?”

If it’s feature-domain, it belongs in `modules/<feature>` even if multiple features *currently* want it.

---

## 7) If you want, I can propose a “move list”

If you tell me which shared capabilities you expect to gain server-only utilities next (e.g., `http`, `telemetry`,
`validation`), I can recommend:

- exactly which `shared/<capability>/server/` folders to create now vs later,
- and a short set of import rules to put into each `README.md` so future contributors don’t accidentally cross
  boundaries.