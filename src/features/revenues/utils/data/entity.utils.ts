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
import { formatMonthDateRange } from "@/features/revenues/utils/date/revenue-date.utils";
import {
  type RevenueId,
  toPeriod,
  toRevenueId,
} from "@/lib/definitions/brands";

/**
 * Creates a default RevenueEntity for a specific period.
 * Centralizes the creation of default revenue database records to ensure consistency.
 * This function creates a database-compatible entity that matches the RevenueEntity interface.
 *
 * @param period - Period in YYYY-MM format
 * @returns Complete RevenueEntity with default values
 */
function _createDefaultRevenueEntity(period: string): RevenueEntity {
  const timestamp = new Date();
  const entityId = toRevenueId(crypto.randomUUID());

  return {
    calculationSource: "invoice_aggregation_rolling_12m",
    createdAt: timestamp,
    id: entityId,
    invoiceCount: 0,
    period: toPeriod(period),
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
function _transformToRevenueEntity(
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
