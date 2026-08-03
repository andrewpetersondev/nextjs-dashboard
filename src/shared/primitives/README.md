# Primitives

## Purpose

Domain-agnostic value-type building blocks: branded-ID and enum factories,
money formatting, and the branded `Period` type.

## Boundaries

No `server/` or `logic/` split here — everything is universal:

- `core/id/` — `createIdFactory` for branded IDs (used by module ID brands).
- `core/enums/` — `createEnumValidator` (Result-returning enum guards).
- `money/` — `formatCurrency` + USD constants (`CENTS_IN_DOLLAR`; amounts are
  integer cents everywhere).
- `period/` — branded `Period` (first-of-month `Date`) with factory/mappers,
  used by invoice revenue periods.

## Import Rules

- MAY import from `@/shared/core/**`
- MUST NOT import from `@/modules/**`
