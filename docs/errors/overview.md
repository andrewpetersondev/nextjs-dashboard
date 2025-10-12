# Errors Overview

## DAL (postgresql database with drizzle orm)

### Here’s a concise checklist of error types you should expect and handle in a DAL with Postgres + Drizzle ORM:

- Connectivity/Infrastructure
    - Network timeouts, DNS issues, connection pool exhaustion/leaks
    - Database unavailable, failover, TLS/SSL negotiation errors
    - Transaction aborted due to server restart or statement timeout

- Query/Statement
    - Syntax errors (bad SQL generated or raw SQL mistakes)
    - Parameter binding/serialization errors (e.g., dates, JSON, arrays)
    - Result parsing/mapping errors (unexpected NULLs, type coercion issues)

- Constraint/Integrity
    - Unique constraint violations (e.g., duplicate email)
    - Foreign key violations (orphan references)
    - Check constraint violations (custom validation in DB)
    - Not-null violations
    - Exclusion constraints (e.g., overlapping ranges)
    - Primary key conflicts

- Concurrency/Isolation
    - Deadlocks (two transactions lock each other)
    - Serialization failures (repeatable read/serializable conflicts)
    - Lost updates when not using safe concurrency controls
    - Lock timeouts

- Transactional Workflow
    - Partial failure in multi-step ops (requires atomic transactions)
    - Improper nesting or missing rollback on error
    - Long-running transactions holding locks

- Performance/Resource
    - Statement timeout due to missing indexes or large scans
    - Out-of-memory on large result sets
    - Large payloads (blobs/JSON) causing slow I/O

- Encoding/Locale
    - Character encoding errors (UTF-8 issues)
    - Collation/sort order differences affecting comparisons

- Security/Permissions
    - Insufficient privileges (role lacks SELECT/INSERT/UPDATE)
    - Row-Level Security policy violations
    - SQL injection attempts (should be prevented via parameterization)

- Schema Drift/Migration
    - Columns missing/renamed (app <-> DB mismatch)
    - Enum changes not reflected in app types
    - View/materialized view invalidation

- ORM/Driver-Specific
    - Drizzle metadata/type inference mismatches
    - Adapter/driver-specific error codes not normalized
    - Connection pool misconfiguration (max, idle, acquire timeouts)

- Data Semantics
    - Business invariants not enforced by DB (e.g., “active user must have verified email”)
    - Unexpected null/empty returns where invariants expect a row
    - Idempotency violations in “create-if-not-exists” flows

### Recommended handling patterns in the DAL:

- Normalize errors:
    - Unique violations → ConflictError
    - Everything else DB-related → DatabaseError (with safe context)
- Treat invariants explicitly: if an operation must return a row, throw a clear Error when it doesn’t.
- Always run multi-step writes in a transaction and map concurrency conflicts distinctly (e.g., retry strategy
  upstream).
- Log with minimal, non-sensitive context (operation name, identifiers; never secrets).
- Use statement/lock timeouts and tune pool settings; surface timeouts as DatabaseError with a recognizable
  message/code.
- Keep Postgres error code-aware mapping (unique_violation 23505, foreign_key_violation 23503, check_violation 23514,
  not_null_violation 23502, serialization_failure 40001, deadlock_detected 40P01, lock_not_available 55P03,
  query_canceled 57014).

## REPO

Here’s a concise checklist of error types a Repository layer should handle (Postgres + Drizzle):

- Mapping/Composition
    - DAL-to-domain mapping failures (missing fields, unexpected nulls)
    - DTO/schema drift vs DB shape (renamed columns, enum changes)
    - Versioning mismatches between domain types and persistence models

- Invariants/Business Rules
    - Entity not found when required (missing row)
    - Duplicate business state (e.g., “one active session per user”)
    - Referential workflow violations not enforced by DB (e.g., “cannot delete if has active children”)

- Concurrency/Consistency
    - Stale reads and lost updates (missing optimistic locking/version checks)
    - Upsert race conditions (non-atomic read-then-insert)
    - Serialization/deadlock conflicts surfaced from DAL needing retry policy

- Query Semantics
    - Over/under-selection (N+1, unintended full scans)
    - Pagination/ordering inconsistencies (non-deterministic order without tie-breakers)
    - Soft-delete filters missed or incorrectly applied

- Aggregates/Joins
    - Partial aggregate hydration (child collections truncated or missing)
    - Incorrect join cardinality (1..n treated as 1..1 or vice versa)
    - Misapplied filters across joins changing intended domain meaning

- Validation/Normalization
    - Input normalization gaps (IDs, slugs, case sensitivity)
    - Domain validation missed prior to persistence (leading to DB constraint errors)
    - Unsafe defaults (null/empty treated as valid domain states)

- Error Adaptation
    - Database/driver errors not normalized (propagate raw errors)
    - Unique/foreign key/check violations not mapped to Conflict/Validation semantics
    - Timeouts/infra issues not mapped to retriable Infrastructure/Database kinds

- Transactions/Units of Work
    - Missing atomicity across multi-entity operations
    - Leaking transaction boundaries (mixing transactional and non-transactional calls)
    - Inconsistent read isolation choice for a use case

- Caching/Second-Level Storage (if used)
    - Stale cache vs DB source of truth
    - Cache write-through/write-back failures
    - Invalidation misses on related entities

- Security/Authorization
    - Missing tenant scoping or RLS expectations not mirrored in queries
    - Leaking cross-tenant data via joins or absent predicates

- Performance/Resource
    - Inefficient projections (SELECT *)
    - Large payload materialization (hydrates big graphs unnecessarily)
    - Non-indexed search/order causing timeouts

Repository-layer handling patterns:

- Map DAL errors:
    - Unique/constraint → Conflict (or domain-specific)
    - Not found when required → NotFound/Invariant
    - Timeouts/infra → Database/Infrastructure with retriable hint
- Enforce domain invariants before/after DAL calls; never rely solely on DB.
- Use explicit transactions for multi-entity mutations; apply retries for known concurrency codes.
- Apply optimistic locking (version column) or deterministic upserts where needed.
- Centralize mappers and result types; return consistent RepositoryError discriminated unions.
