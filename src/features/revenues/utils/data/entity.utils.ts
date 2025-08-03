/**
 * Entity utility functions for revenue data.
 *
 * This file contains functions for creating and transforming revenue entities,
 * centralizing the logic for entity manipulation across the application.
 */

import "server-only";

import type {
  RevenueDisplayEntity,
  RevenueEntity,
} from "@/features/revenues/core/revenue.entity";
import type { RollingMonthData } from "@/features/revenues/core/revenue.types";
import { createRevenueDisplayEntity } from "@/features/revenues/core/revenue.types";
import { formatMonthDateRange } from "@/features/revenues/utils/date/revenue-date.utils";
import type { RevenueId } from "@/lib/definitions/brands";
import { toRevenueId } from "@/lib/definitions/brands";

/**
 * Creates a default month data structure for months without revenue.
 *
 * Ensures type safety and consistent zero-value initialization for months
 * that don't have corresponding invoice data.
 *
 * @param month - Month name (e.g., "Jan", "Feb")
 * @param monthNumber - Month number (1-12)
 * @param year - Four-digit year
 * @returns RevenueDisplayEntity with zero values
 */
export function createDefaultMonthData(
  _month: string,
  monthNumber: number,
  year: number,
): RevenueDisplayEntity {
  const period = `${year}-${String(monthNumber).padStart(2, "0")}`;
  // Create a default RevenueEntity and then transform it to RevenueDisplayEntity
  const defaultEntity: RevenueEntity = {
    calculationSource: "template",
    createdAt: new Date(),
    id: toRevenueId(`template-${period}`),
    invoiceCount: 0,
    period,
    revenue: 0,
    updatedAt: new Date(),
  };

  return createRevenueDisplayEntity(defaultEntity);
}

/**
 * Creates default revenue display entity for a specific period.
 * This function creates a RevenueDisplayEntity object by first creating a default
 * RevenueEntity and then transforming it using the factory method.
 * Use createDefaultRevenueEntity if you need a database-compatible entity.
 *
 * @param period - Period in YYYY-MM format
 * @returns Complete RevenueDisplayEntity with default values
 */
export function createDefaultRevenueData(period: string): RevenueDisplayEntity {
  // Create a default RevenueEntity
  const defaultEntity: RevenueEntity = {
    calculationSource: "template",
    createdAt: new Date(),
    id: toRevenueId(`template-${period}`),
    invoiceCount: 0,
    period,
    revenue: 0,
    updatedAt: new Date(),
  };

  // Transform to RevenueDisplayEntity using the factory method
  return createRevenueDisplayEntity(defaultEntity);
}

/**
 * Creates a default RevenueEntity for a specific period.
 * Centralizes the creation of default revenue database records to ensure consistency.
 * This function creates a database-compatible entity that matches the RevenueEntity interface.
 *
 * @param period - Period in YYYY-MM format
 * @returns Complete RevenueEntity with default values
 */
export function createDefaultRevenueEntity(period: string): RevenueEntity {
  const timestamp = new Date();
  const entityId = toRevenueId(crypto.randomUUID());

  return {
    calculationSource: "invoice_aggregation_rolling_12m",
    createdAt: timestamp,
    id: entityId,
    invoiceCount: 0,
    period,
    revenue: 0,
    updatedAt: timestamp,
  };
}

/**
 * Creates a complete revenue entity data structure with all required fields.
 *
 * @param data - Revenue display entity
 * @param _template - Month template data
 * @param _dateRange - Start and end dates for the month
 * @param timestamp - Creation/update timestamp
 * @param entityId - Unique identifier for the entity
 * @returns Complete RevenueEntity object
 */
export function createRevenueEntityData(
  data: RevenueDisplayEntity,
  _template: RollingMonthData,
  _dateRange: { startDate: string; endDate: string },
  timestamp: Date,
  entityId: RevenueId,
): RevenueEntity {
  return {
    calculationSource: "invoice_aggregation_rolling_12m",
    createdAt: timestamp,
    id: entityId,
    invoiceCount: data.invoiceCount,
    period: data.period,
    revenue: data.revenue,
    updatedAt: timestamp,
  };
}

/**
 * Transforms a revenue display entity into a complete revenue entity.
 *
 * Combines display entity data with template information and adds metadata
 * such as date ranges, timestamps, and unique identifiers.
 *
 * @param data - Revenue display entity from query or default
 * @param _displayOrder - Order index within the 12-month sequence
 * @param template - Template data containing month metadata
 * @returns Complete RevenueEntity with all required fields
 */
export function transformToRevenueEntity(
  data: RevenueDisplayEntity,
  _displayOrder: number,
  template: RollingMonthData,
): RevenueEntity {
  const dateRange = formatMonthDateRange(template.year, template.monthNumber);
  const baseTimestamp = new Date();
  const entityId = toRevenueId(crypto.randomUUID());

  return createRevenueEntityData(
    data,
    template,
    dateRange,
    baseTimestamp,
    entityId,
  );
}
