import "server-only";
import type { RevenueSource } from "@/features/revenues/domain/types";
import type { Period, RevenueId } from "@/shared/branding/brands";
import type { Cents } from "@/shared/utilities/money/types";

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
  readonly totalPaidAmount: Cents;
  readonly totalPendingAmount: Cents;
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
  | "invoiceCount"
  | "totalAmount"
  | "totalPaidAmount"
  | "totalPendingAmount"
  | "calculationSource"
>;
