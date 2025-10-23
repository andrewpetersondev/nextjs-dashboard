---
apply: off
---

# Auth Module Rules (Current Focus)

## Purpose

Guide changes in the auth module to ensure consistent layering, error/result handling, and safe server-only boundaries.

## Precedence

- Governing: project-rules.md
- Types: typescript-rules.md
- Results: results.md
- Errors: errors.md, error-classes.md
- Structure: structure-summary.md

## Rules

1. Layering and imports
   1.1 Service must depend only on Repository ports and small utilities (e.g., password hashing) injected via constructor; no direct DAL or framework imports.
   1.2 Repository may use DAL and map infrastructure errors to domain/BaseError; it must not return AppError.
   1.3 Actions/route handlers adapt Service Result<AppError> to UI or FormResult; never throw to UI.
   1.4 Server-only code must not be imported by client components; keep env, DB, and crypto under server directories.

2. Result contract
   2.1 Services never throw; they return Result<T, AppError> as per results.md.
   2.2 Use try/catch only at service and action edges; map unknown to AppError once.
   2.3 Preserve discriminant ok: true|false only; do not add alternate flags.

3. Error modeling
   3.1 Use domain/BaseError variants internally (e.g., VALIDATION, NOT_FOUND, UNAUTHORIZED, FORBIDDEN, CONFLICT).
   3.2 Normalize at boundaries: unknown/BaseError → AppError via centralized adapters; no AppError inside DAL/Repo.
   3.3 Log internal errors with redaction; avoid leaking secrets (passwords, tokens) in details.

4. Auth specifics
   4.1 Signup: hash password in Service, persist atomically via repo.withTransaction; return Ok(user transport) or Err(AppError with code: VALIDATION | CONFLICT | UNKNOWN).
   4.2 Login: fetch by email, compare hash via injected hasher; on mismatch return Err(AppError with code: UNAUTHORIZED) using a generic “invalid credentials” message.
   4.3 Do not expose whether email exists; use the same error for wrong email/password.
   4.4 Redact credentials in logs; never attach raw passwords or tokens to error context.
   4.5 Role assignment must be explicit and validated; default to a safe baseline role.
   4.6 All user objects crossing service boundary must be a transport shape without password fields.

5. Transactions and consistency
   5.1 Use repo.withTransaction for multi-step signup or credential updates.
   5.2 Ensure uniqueness is enforced in DB and mapped to a domain/CONFLICT error in Repo.

6. Testing
   6.1 Unit-test Service with mocked Repository/Hasher ports; assert Result branches only.
   6.2 Repo tests assert error mapping (e.g., DB unique violation → CONFLICT).
   6.3 E2E: verify identical error behavior for nonexistent email vs wrong password.

7. TypeScript hygiene
   7.1 Export explicit types for inputs/outputs (SignupData, LoginData, AuthUserTransport).
   7.2 Mark inputs as Readonly and avoid mutation; prefer readonly fields in entities/DTOs.
   7.3 No non-null assertions; narrow with guards and early returns.

8. Security
   8.1 Password hashing via a dedicated hasher port; no inline crypto in Service.
   8.2 Session issuance is separate from credential verification; keep concerns isolated.
   8.3 Follow least-privilege for role defaults and checks; centralize role conversions.

9. Low‑Token Playbook (Auth)
   9.1 When changing contracts, update types and all adapters in a single batch.
   9.2 Ask for exact file paths and symbol names before edits; avoid broad file openings.
   9.3 Prefer targeted snippets for adapter/error maps over full-file rewrites.

## References

- See shared rules listed in Precedence for full APIs and helpers.
