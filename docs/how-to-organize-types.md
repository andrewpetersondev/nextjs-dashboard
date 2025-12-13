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
