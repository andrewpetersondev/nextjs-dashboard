# What are Policy Types?

## “Policy types” vs other types: what’s the difference?

A **policy type** describes **a rule-driven decision** the domain makes.

It’s not just “a type that lives near constants.” It’s a type whose _reason for existing_ is to encode rule outcomes and make them explicit.

### Policy type characteristics

- Encodes **business/security rules** (e.g., refresh threshold, absolute lifetime)
- Represents **expected decisions**, not exceptional errors
- Helps ensure callers handle all cases (discriminated unions shine here)
- Stays stable even if infrastructure changes (cookies vs headers vs storage)

Examples (conceptually):

- `ShouldRefreshDecision = { refresh: true; ... } | { refresh: false; reason: "not_needed" }`
- `SessionValidity = "valid" | "expired" | "tampered"`
- `AbsoluteLifetimeDecision = ...`

### How that differs from…

- **Contracts / Ports**: interfaces that define capabilities between layers (e.g., `SessionPort`, `SessionTokenCodecPort`).
- **Payloads / DTOs**: data shapes for transport across boundaries (HTTP, actions, UI).
- **Entities**: domain objects with identity/invariants (user, session).
- **Infrastructure types**: database row shapes, JWT library payloads, etc.

**Rule of thumb:**  
If the type answers **“what did the rules decide?”**, it’s a **policy type**.  
If it answers **“how do we talk to another layer/system?”**, it’s a **contract/DTO/port**.

---ß

## Should policies be separated from other types?

Yes, _when it improves clarity_, and session management is one of those places.

### Practical guidance

- Keep **policy constants + policy decision types** together (e.g., `domain/session/session.policy.ts` or similar).
- Keep **payload/codecs** (JWT claims schemas) in `schemas/types`.
- Keep **ports/contracts** in `server/application/ports`.
- Keep **DTOs for UI/HTTP** in boundary modules or `ui` types (unless they’re truly domain-level).

You don’t need to over-separate into a dozen files. A simple split is often enough:

- `session.constants.ts` → policy constants (durations, thresholds, absolute max)
- `session.policy.ts` → pure functions + decision types (`shouldRefresh`, `absoluteLifetimeDecision`)
- `session-payload.types.ts` → transport-ish claim/payload shapes (if they’re used for encoding/decoding)

---

# Part 2

## A clean way to organize “types” in `@/modules/auth`

The trick is to **stop treating “types” as one bucket** and instead file them by **why they exist** (domain rule vs transport shape vs boundary contract vs persistence model). In auth, that usually becomes: **domain/user**, **domain/session**, **server/application ports**, and **UI types**.

Below is a structure that fits what you already have, without over-splitting into 20 files.

---

## 1) Use 4 “type buckets” (rule of thumb)

### A) **Domain types** (stable concepts)

Put here types that represent _auth concepts_ that should remain stable even if infrastructure changes (DB, cookies, JWT library, etc.)

- User identity / role types
- Session identity / session “meaning”
- Policy outcomes (discriminated unions that represent decisions)

**Folder:** `src/modules/auth/domain/**`

---

### B) **Transport / boundary DTOs** (shapes that cross a boundary)

These are shapes that represent “what leaves or enters a boundary”, e.g.

- What an action returns to UI
- What an API returns
- What you embed into a token payload

These can still live in domain **if the boundary is internal to the module**, but the naming should make it obvious they’re DTO-ish.

**Folder options:**

- `src/modules/auth/domain/...` (if used across server/ui and you want it “module public”)
- or `src/modules/auth/server/...` / `src/modules/auth/ui/...` (if truly boundary-specific)

---

### C) **Ports / contracts** (hexagonal interfaces)

Interfaces like repositories and session ports live with application code.

**Folder:** `src/modules/auth/server/application/ports/**`

---

### D) **Infrastructure/persistence shapes** (DB row types, adapter-only)

If a type exists because _Drizzle returns this row shape_, keep it in infrastructure.

**Folder:** `src/modules/auth/server/infrastructure/**`

---

## 2) Practical file naming that scales

### `domain/user/`

Keep it boring and predictable:

- `auth.roles.ts` → role constants + `UserRole`
- `auth.schema.ts` → zod schemas + inferred input/output types
- `auth.mappers.ts` → mapping functions
- `auth.guards.ts` → type guards
- **Split “auth.types.ts” by intent** (recommended):

**Suggested:**

- `auth.entities.ts` → `AuthUserEntity` (things with invariants/identity)
- `auth.payloads.ts` → repo/service payload shapes (inputs/outputs for app core)
- `auth.transport.ts` → shapes meant to leave the core (DTO/transport)

This is the biggest win: it prevents a single `auth.types.ts` from becoming a junk drawer.

---

### `domain/session/`

This area is already close to ideal. I’d just align naming to intent:

- `session.constants.ts` → policy constants
- `session.schemas.ts` → zod codecs/schemas (JWT-ish claims validation)
- `session.policy.ts` → pure policy functions + decision types  
  (example: `ShouldRefreshDecision`, `UpdateSessionDecision`, etc.)
- `session.types.ts` (or `session.models.ts`) → core session types that aren’t payload/DTO

If a type is “what did the rules decide?” → **policy** file.  
If a type is “what do we store in the token?” → **payload** or **schemas** file.

---

## 3) Where should “transport” types live?

If a type is used by **server actions + UI** and is **not specific to Next.js**, it’s fine to keep it under `domain/**` as “module public types”.

If it’s tied to a specific boundary (example: “form action return payload”), prefer putting it closer to that boundary:

- `server/actions/*.types.ts` for action-specific shapes
- `ui/**/*.types.ts` for UI-only props/models

---

## 4) Minimal migration plan (low-risk)

1. **Pick the current “catch-all” file** (often `auth.types.ts`) and split into:

- `auth.entities.ts`
- `auth.payloads.ts`
- `auth.transport.ts`

2. Update imports (mechanical change).
3. Later, do the same for session if needed:

- move decision unions into `session.policy.ts`

---

## 5) One clarifying question (so I can be precise)

When you say “organize types in `@folder:auth`”, are you aiming for:

1. **Mostly moving files around** (rename/split types files), or
2. **Creating a public “types API”** for the module (a deliberate set of exports other modules consume)?

If you tell me which one, I’ll suggest an exact target tree + naming conventions that match that goal.
