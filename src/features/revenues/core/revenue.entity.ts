import "server-only";

import type { RevenueSource } from "@/features/revenues/core/revenue.types";
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
 * @param month - note i think month is a string like '00', --- '11'
 */
export interface RevenueDisplayEntity extends RevenueEntity {
  readonly month: string;
  readonly year: number;
  readonly monthNumber: number;
}
