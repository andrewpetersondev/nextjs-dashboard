# DB DAL Error Boundary Checklist

Here’s a concise checklist to harden the DAL ↔ database error boundary:

1. Normalize unknown errors

- Capture unknown errors from the driver/ORM and normalize to a single internal error model (BaseError or typed variants).
- Preserve original error as cause; never lose stack/pg fields.

2. Map PG error codes

- Detect and map canonical Postgres codes:
  - 23505 → ConflictError (include constraint, table, field hint if known).
  - 23502 → Not-null violation (DatabaseError with code; include column if available).
  - 23503 → Foreign key violation.
  - 23514 → Check constraint violation.
  - 40001, 40P01, 55P03, 57014 → Mark retryable: true.
- Provide a default “DATABASE” code for all unmapped cases.

3. Constraint-to-field hints

- Maintain a readonly constraint→field map per table/domain.
- Pass hints into the mapper so ConflictError can target a specific field (e.g., email/username).

4. Log structured context

- Log once at the DAL boundary with:
  - context (e.g., dal.users.insert), operation name, identifiers (non-sensitive).
  - pg metadata when present: code, constraint, table, schema, detail.
- Exclude secrets (passwords/tokens); keep logs JSON-safe.

5. Consistent error messages

- Use short, recognizable, non-leaky messages for each mapped code.
- Avoid surfacing raw SQL, query text, or connection info.

6. Retry semantics

- Flag transient PG codes as retryable at error.details.retryable = true.
- Do not auto-retry in DAL; leave policy to higher layers.

7. Invariant checks post-DB call

- Validate expectations (e.g., returning row exists, affected row count).
- Throw a typed DatabaseError with clear invariant context if violated.

8. Throw, don’t return, in DAL

- DAL methods either return valid data or throw typed errors.
- No AppError at this layer; only BaseError variants.

9. Transaction boundaries

- Wrap multi-step operations in a transaction helper that:
  - Reuses the same error normalization/mapping.
  - Adds transaction context in logs/details.

10. Typing and safety

- No any; narrow unknown driver error to a PgError-like reader.
- Mark extracted fields readonly; guard with safe string reads.
- Exported DAL functions have explicit parameter/return types.

11. Test coverage

- Unit tests per code mapping (23505, 23502, 23503, 23514, transient set).
- Tests for constraint→field mapping.
- Tests for invariant “no row returned”.
- Assertions that retryable flag is set for transient codes.
- Snapshot or shape tests for logged details (sanitized).

12. Observability hooks

- Ensure all normalized errors include:
  - code, message, context, identifiers, and optional pg fields (constraint/table/schema/detail).
- Keep messages stable for alerting; put variability in details.

13. Configuration hygiene

- Timeouts and statement_timeouts configured at the driver/connection level.
- Ensure canceled/timeout errors map to queryCanceled and are marked retryable.

14. Boundary purity

- DAL does not translate to UI/App errors.
- No rethrowing raw driver errors; always normalized first.
