import "server-only";

import type {
  MonthName,
  RevenueSource,
} from "@/features/revenues/core/revenue.types";
import type { Period, RevenueId } from "@/lib/definitions/brands";

/**
 * Represents a revenue entity in the database.
 */
export interface RevenueEntity {
  readonly calculationSource: RevenueSource;
  readonly createdAt: Date;
  readonly id: RevenueId;
  readonly invoiceCount: number;
  readonly period: Period; // e.g. 2024-01
  readonly revenue: number; // In cents
  readonly updatedAt: Date;
}

/**
 * Domain model for creating a new revenue record (excludes `id`).
 */
export type RevenueCreateEntity = Omit<RevenueEntity, "id">;

/**
 * Narrow domain model for updating a revenue record (only updatable fields).
 */
export type RevenueUpdatable = Pick<
  RevenueEntity,
  "invoiceCount" | "revenue" | "calculationSource"
>;

/**
 * Display-oriented entity extending RevenueEntity with UI-specific fields.
 * - month: Three-letter month abbreviation (e.g., "Jan", "Feb")
 * - monthNumber: Calendar month number (1-12)
 */
export interface RevenueDisplayEntity extends RevenueEntity {
  readonly month: MonthName;
  readonly year: number;
  readonly monthNumber: number; // 1..12
}
