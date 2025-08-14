# Revenues Repository

This directory contains the repository layer for the revenue feature. The repository pattern provides a clean abstraction over data access operations, isolating domain logic from persistence details.

## Overview

The repository layer handles:
- Persistence operations for revenue entities (CRUD + queries)
- Mapping between database rows and domain entities
- Conflict resolution on period uniqueness (upsert)
- Validation and error normalization (domain-centric errors)

## Core invariants

- Period is the uniqueness key: exactly one row per month (period is a DATE set to the first day of the month).
- Timestamps:
  - createdAt is set on insert.
  - updatedAt is refreshed on every write (insert and update).
- All inputs are validated; invalid inputs and constraint violations surface as ValidationError. Unexpected persistence or mapping failures surface as DatabaseError.

## Error model

- ValidationError:
  - Missing/invalid inputs
  - Period branding/format errors
  - Uniqueness/constraint violations (surfaced as validation errors)
- DatabaseError:
  - Unexpected persistence failures
  - Mapping issues converting raw rows to domain entities

## Types (at a glance)

- RevenueCreateEntity: Full creation payload (all fields except id).
- RevenueUpdatable: Narrow update payload (invoiceCount, totalAmount, calculationSource).
- Period: Branded first-of-month date value (e.g., "2025-08-01"); always validate/convert with toPeriod() at boundaries.

## Files

### revenue.repository.interface.ts

Defines the contract for the revenue repository via RevenueRepositoryInterface. Implementations should enforce the core invariants and error model.

Key methods:
- create(revenue: RevenueCreateEntity): Promise<RevenueEntity>
  - Delegates to upsert() in implementations to avoid duplication.
- read(id: RevenueId): Promise<RevenueEntity>
  - Fetches by ID; throws ValidationError on bad input, DatabaseError if not found or mapping fails.
- update(id: RevenueId, revenue: RevenueUpdatable): Promise<RevenueEntity>
  - Updates invoiceCount, totalAmount, calculationSource. Sets updatedAt = now; createdAt unchanged.
- delete(id: RevenueId): Promise<void>
  - Deletes by ID with validation and error handling.
- findByDateRange(startPeriod: Period, endPeriod: Period): Promise<RevenueEntity[]>
  - Inclusive range query by branded Period (first-of-month DATE); implementations typically sort by period desc.
- upsert(revenue: RevenueCreateEntity): Promise<RevenueEntity>
  - Insert-or-update by unique period. On conflict, updates fields and sets updatedAt = now. Insert sets createdAt (provided or now) and updatedAt = now.
- deleteById(id: RevenueId): Promise<void>
  - Alias for delete(id); retained for backward compatibility.
- findByPeriod(period: Period): Promise<RevenueEntity | null>
  - Returns null if not found (absence is non-exceptional).
- upsertByPeriod(period: Period, revenue: RevenueUpdatable): Promise<RevenueEntity>
  - Enforces the provided period as the source of truth.
  - Accepts only updatable fields; timestamps are assigned internally (createdAt = now on insert, updatedAt = now on every write).
  - Delegates to upsert() for conflict handling.

### revenue.repository.ts

Concrete implementation backed by Drizzle ORM.

Highlights:
- All writes funnel through upsert() to ensure consistent conflict handling.
- Timestamps are assigned server-side; caller clocks are not trusted.
- Mappers convert DB rows to domain entities; failures surface as DatabaseError.
- Period inputs are validated/branded via toPeriod() as first-of-month DATE values.

Method behavior and timestamp semantics:
- create(): delegates to upsert() for insert-or-update.
- read(): retrieves by ID; throws DatabaseError if missing or mapping fails.
- update(): updates mutable fields; sets updatedAt = now (createdAt unchanged).
- delete(): deletes by ID with validation and error handling.
- findByDateRange(): inclusive query by branded Period; typically ordered by period desc.
- findByPeriod(): returns entity or null if absent.
- upsert():
  - Insert: createdAt = provided or now; updatedAt = now.
  - Update (conflict on period): createdAt unchanged; updatedAt = now.
- upsertByPeriod():
  - Overwrites any incoming period with the provided method parameter.
  - RevenueCreateEntity -> preserve createdAt, set updatedAt = now.
  - RevenueUpdatable -> build full creation payload with createdAt = now, updatedAt = now.
  - Delegates to upsert().

## Choosing the right method

- You have a complete creation payload with a trusted createdAt: use upsert().
- You computed the period externally and only have updatable fields: use upsertByPeriod(period, updatable).
- You just want to modify invoiceCount/totalAmount/calculationSource by id: use update(id, updatable).
- You need to fetch a specific period or a range: use findByPeriod() or findByDateRange().

## Usage examples

Creating and querying:
```typescript
// TypeScript
import { RevenueRepository } from "@/features/revenues/repository/revenue.repository";
import { getDB } from "@/db/connection";
import type { Period } from "@/lib/definitions/brands";
import type {
RevenueCreateEntity,
RevenueUpdatable,
} from "@/features/revenues/core/revenue.entity";

const repo = new RevenueRepository(getDB());

// Create (delegates to upsert)
const created = await repo.create({
calculationSource: "seed",
createdAt: new Date(),
invoiceCount: 3,
period: new Date("2024-08-01") as Period,
totalAmount: 125_00, // cents
updatedAt: new Date(),
});

// Upsert directly
const upserted = await repo.upsert({
...created,
totalAmount: 150_00,
});

// Update by id (only mutable fields)
const updated = await repo.update(created.id, {
calculationSource: "handler",
invoiceCount: 4,
totalAmount: 175_00,
});

// Find by period
const existing = await repo.findByPeriod(new Date("2024-08-01") as Period);

// Range query
const ranged = await repo.findByDateRange(
new Date("2024-01-01") as Period,
new Date("2024-12-01") as Period,
);
```
Using upsertByPeriod with a known period:
```typescript
// TypeScript
const period = new Date("2024-08-01") as Period;

// Provide only updatable fields; repository assigns timestamps internally
const result = await repo.upsertByPeriod(period, {
  calculationSource: "invoice_event",
  invoiceCount: 1,
  totalAmount: 20_00,
});
```
## Testing and DI

- Inject a Database instance via the repository constructor.
- For unit tests, provide a mock or in-memory DB to verify:
  - Period uniqueness and conflict behavior (upsert paths)
  - Timestamp semantics (createdAt vs updatedAt)
  - Validation and error translation (ValidationError/DatabaseError)

## Performance and consistency notes

- Upsert uses a single round-trip with conflict resolution on the period key.
- Ensure an index/unique constraint on the period column for correctness and performance.
- Prefer branded Period utilities (toPeriod/dateToPeriod) at boundaries to prevent format drift.

## Best practices

- Use upsertByPeriod in event-driven flows where period is derived from the event.
- Use upsert when preserving an authoritative createdAt matters.
- Keep business calculations outside the repository; pass only the final values to persist.
- Log at service boundaries; repository methods already surface domain-centric errors.
