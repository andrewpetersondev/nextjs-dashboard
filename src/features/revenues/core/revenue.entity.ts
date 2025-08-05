import "server-only";

import type { Period, RevenueId } from "@/lib/definitions/brands";

/**
 * Represents a revenue entity in the database.
 */
export interface RevenueEntity {
  readonly calculationSource: string; // 'seed' or 'handler' or 'rolling_calculation'
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
 * Partial domain model for updating a revenue record.
 */
export type RevenuePartialEntity = Partial<RevenueCreateEntity>;

/**
 * Display-oriented entity extending RevenueEntity with UI-specific fields.
 * @param month - note i think month is a string like '00', --- '11'
 */
export interface RevenueDisplayEntity extends RevenueEntity {
  readonly month: string;
  readonly year: number;
  readonly monthNumber: number;
}
