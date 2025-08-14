import "server-only";

import type {
  Cents,
  MonthName,
  RevenueSource,
} from "@/features/revenues/core/revenue.types";
import type { Period, RevenueId } from "@/lib/definitions/brands";

/**
 * Represents a revenue entity in the database.
 *
 * This is the core domain entity that represents revenue data as stored
 * in the database with all necessary metadata for tracking and auditing.
 */
export interface RevenueEntity {
  readonly calculationSource: RevenueSource;
  readonly createdAt: Date;
  readonly id: RevenueId;
  readonly invoiceCount: number;
  readonly period: Period;
  readonly totalAmount: Cents;
  readonly updatedAt: Date;
}

/**
 * Domain model for creating a new revenue record (excludes `id`).
 * TODO: Should I omit system-generated fields like "createdAt" & "updatedAt"???????
 */
export type RevenueCreateEntity = Omit<RevenueEntity, "id">;

/**
 * Narrow domain model for updating a revenue record (only updatable fields).
 *
 * Represents the fields that can be safely updated after initial creation.
 * System metadata fields like timestamps are excluded.
 */
export type RevenueUpdatable = Pick<
  RevenueEntity,
  "invoiceCount" | "totalAmount" | "calculationSource"
>;

/**
 * Display-oriented entity extending RevenueEntity with UI-specific fields.
 *
 * This entity adds computed display fields while maintaining all the
 * original entity data for complete context in UI components.
 *
 * @prop month - Three-letter month abbreviation (e.g., "Jan", "Feb")
 * @prop year - The year in YYYY format
 * @prop monthNumber - Calendar month number (1-12)
 */
export interface RevenueDisplayEntity extends RevenueEntity {
  readonly month: MonthName;
  readonly year: number;
  readonly monthNumber: number;
}
