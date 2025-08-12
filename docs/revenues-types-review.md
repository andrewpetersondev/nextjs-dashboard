# Revenues module: Type usage review and refactoring suggestions

This document evaluates how types are used across the Revenues feature and proposes focused refactorings to improve safety, clarity, and maintainability. The goal is to keep runtime logic intact while tightening type contracts and reducing ambiguity.

Scope reviewed
- DB schema: src/db/schema.ts
- Core types: src/features/revenues/core/revenue.entity.ts, revenue.types.ts, revenue.dto.ts
- Mapping: src/features/revenues/core/revenue.mapper.ts
- Repository: src/features/revenues/repository/revenue.repository.interface.ts, revenue.repository.ts
- Services: src/features/revenues/services/*.ts
- Utilities: src/features/revenues/utils/**/*
- Brands: src/lib/definitions/brands.ts

Summary of findings
- Good use of branded types for identifiers and Period.
- Clear separation between Entity, DTO, and Display models.
- Utilities correctly centralize Period parsing and validation.
- Some unions/strings could be tightened (e.g., calculationSource).
- Update contracts are overly broad (Partial of create) and allow accidental fields.
- A few places rely on casts from unknown that can be avoided by strengthening upstream types.

Suggested refactorings (prioritized)



5. Normalize Period creation: prefer toPeriod/dateToPeriod everywhere
   Files: revenue.service.ts, revenue.repository.ts, event service
   Observation: Most places already call toPeriod/dateToPeriod. Maintain this convention for any new inputs to prevent unbranded strings entering the domain.
   Action: No code change required, just keep the practice. Consider ESLint rule to discourage raw string periods.

6. Align repository contracts with domain invariants
   Files: revenue.repository.interface.ts, revenue.repository.ts
   - update should not accept period or createdAt changes.
   - upsert(revenueData) should accept RevenueCreateEntity (kept), but upsertByPeriod should take (period: Period, revenue: RevenueUpdatable) rather than Partial<...> to prevent passing timestamps by mistake.
   - In upsert(), consider restricting set fields in onConflictDoUpdate to only updatable ones (already mostly true).

7. Add branded type guards and factory helpers
   Files: src/lib/definitions/brands.ts
   - You already have toRevenueId, toPeriod etc. Consider adding isPeriod(value: unknown): value is Period and similar for IDs. Useful for runtime input checks without throwing, especially in UI or API layers.

8. Consistency between DB schema and domain brands
   Files: src/db/schema.ts
   - Excellent: Drizzle columns are branded via .$type<Brand>() ensuring typed IDs in rows. Keep this pattern. Ensure that any new columns referencing enums/brands use the same technique.

9. DTOs vs Entities: keep boundaries simple
   Files: revenue.dto.ts, revenue.entity.ts
   - DTOs use dollars, Entities use cents. This is clear and good. Continue ensuring conversions happen only at display/action boundary. Consider a Money utility or branded Cent/Dollar types to prevent accidental mixing:
     type Cents = Brand<number, typeof centsBrand>;
     type Dollars = Brand<number, typeof dollarsBrand>;
     This is optional but helpful in larger codebases.

10. Naming and docs
   - revenue.service.findByPeriod(period: string) converts via toPeriod; you can make the signature findByPeriod(period: Period | string) to communicate flexibility, or better, keep it strictly Period and let callers convert. Right now, event/service callers pass string; consider aligning all internal service contracts to Period.
   - In statistics service, calculateForRollingYear uses toIntervalDuration(duration) which is fine. If duration always equals "year" here, you can keep the type as literal "year" and avoid the conversion.

Illustrative code sketches

A. Narrow calculationSource and updatable fields (non-breaking staged change)

// src/features/revenues/core/revenue.types.ts
export const REVENUE_SOURCES = [
  "seed",
  "handler",
  "invoice_event",
  "rolling_calculation",
  "template",
] as const;
export type RevenueSource = (typeof REVENUE_SOURCES)[number];

// src/features/revenues/core/revenue.entity.ts
export interface RevenueEntity {
  readonly calculationSource: RevenueSource;
  // ...
}
export type RevenueUpdatable = Pick<
  RevenueEntity,
  "invoiceCount" | "revenue" | "calculationSource"
>;

// src/features/revenues/repository/revenue.repository.interface.ts
update(id: RevenueId, revenue: RevenueUpdatable): Promise<RevenueEntity>;
upsertByPeriod(period: Period, revenue: RevenueUpdatable): Promise<RevenueEntity>;

// src/features/revenues/repository/revenue.repository.ts
async update(id: RevenueId, revenue: RevenueUpdatable) { /* ... */ }
async upsertByPeriod(period: Period, revenue: RevenueUpdatable) { /* ... */ }

B. Align display entity month

// Option A
// src/features/revenues/core/revenue.entity.ts
export interface RevenueDisplayEntity extends RevenueEntity {
  readonly month: MonthName;
  readonly year: number;
  readonly monthNumber: number; // 1..12
}

// src/features/revenues/core/revenue.mapper.ts
import { MONTH_ORDER } from "./revenue.types";
export function mapRevEntToRevDisplayEnt(entity: RevenueEntity): RevenueDisplayEntity {
  const monthNumber = extractMonthNumberFromPeriod(entity.period); // 1..12
  return {
    ...entity,
    month: MONTH_ORDER[monthNumber - 1],
    monthNumber,
    year: parseInt(entity.period.substring(0, 4), 10),
  };
}

C. Simplify mapRevDisplayEntityToPeriod

export function mapRevDisplayEntityToPeriod(dataItem: RevenueDisplayEntity): Period {
  return toPeriod(dataItem.period); // validate/brand once more; or just return dataItem.period
}

Risk and migration notes
- Changing calculationSource type and update contracts is a breaking type change; update call sites accordingly (services and tests). This is localized and low-risk.
- Adjusting RevenueDisplayEntity.month to MonthName requires updating any consumers that expect "MM" strings. UI that displays month abbreviations will benefit.
- Simplifying mapRevDisplayEntityToPeriod is safe if we ensure all display entities originate from domain entities (mapper) or template utils—which already include period.

Quick wins you can do right away
- Add RevenueSource union and use it in RevenueEntity. Update a few literal assignments.
- Replace RevenuePartialEntity with a narrower RevenueUpdatable.
- Update mapper to return MonthName for display entities.
- Add isPeriod and isBrandedId helpers for non-throw validation paths.

Overall assessment
The revenues codebase already demonstrates robust use of TypeScript with branded types, clear domain vs DTO separation, and safe period handling. The suggestions above aim to eliminate the remaining "stringly-typed" areas, reduce reliance on broad Partial types, and better encode invariants in the type system so future changes are safer by construction.
