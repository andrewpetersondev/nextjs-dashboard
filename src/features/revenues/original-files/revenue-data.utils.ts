/**
 * @file revenue-data.utils.ts
 * Utility functions for data transformation and manipulation related to revenue calculations.
 *
 * This file contains functions for creating, transforming, and manipulating revenue data
 * structures. These functions have been extracted from the RevenueCalculatorService to
 * improve code organization and reusability.
 */

import "server-only";

import type { RevenueEntity } from "@/db/models/revenue.entity";
import type {
  RevenueDisplayEntity,
  RevenueStatistics,
  RollingMonthData,
} from "@/features/revenues/revenue.types";
import {
  createRevenueDisplayEntity,
  MONTH_ORDER,
} from "@/features/revenues/revenue.types";
import { formatMonthDateRange } from "@/features/revenues/revenue-date.utils";
import type { RevenueId } from "@/lib/definitions/brands";
import { toRevenueId } from "@/lib/definitions/brands";

/**
 * Creates an efficient lookup map for revenue data indexed by year-month key.
 *
 * @param actualData - Array of revenue data from database query
 * @returns Map with year-month keys and corresponding revenue data
 *
 * @remarks
 * Time complexity: O(n) where n is the number of actual data records
 */
export function createDataLookupMap(
  actualData: RevenueDisplayEntity[],
): Map<string, RevenueDisplayEntity> {
  const dataMap = new Map<string, RevenueDisplayEntity>();

  actualData.forEach((dataItem) => {
    const { year, monthNumber } = dataItem;
    const lookupKey = generateLookupKey(year, monthNumber);
    dataMap.set(lookupKey, dataItem);
  });

  return dataMap;
}

/**
 * Retrieves existing revenue data for a month or creates default empty data.
 *
 * Ensures consistent data structure across all 12 months by providing
 * zero-value defaults for months without revenue data.
 *
 * @param monthTemplate - Template data for the target month
 * @param dataLookup - Map containing actual revenue data
 * @returns Complete monthly revenue data (actual or default)
 */
export function getMonthDataOrDefault(
  monthTemplate: RollingMonthData,
  dataLookup: Map<string, RevenueDisplayEntity>,
): RevenueDisplayEntity {
  const { year, monthNumber, month } = monthTemplate;
  const lookupKey = generateLookupKey(year, monthNumber);
  const existingData = dataLookup.get(lookupKey);

  if (existingData) {
    return existingData;
  }

  return createDefaultMonthData(month, monthNumber, year);
}

/**
 * Generates a consistent lookup key for year-month combination.
 *
 * @param year - Four-digit year
 * @param monthNumber - Month number (1-12)
 * @returns Formatted key string in "YYYY-MM" format
 */
export function generateLookupKey(year: number, monthNumber: number): string {
  return `${year}-${String(monthNumber).padStart(2, "0")}`;
}

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
 * Creates month template data with validated month name lookup.
 *
 * @param displayOrder - Display order in the 12-month sequence (0-11)
 * @param monthDate - Date object for the specific month
 * @param calendarMonthIndex - Zero-based month index (0-11)
 * @returns RollingMonthData object with all required fields
 *
 * @throws {Error} When calendarMonthIndex is outside valid range (0-11)
 */
export function createMonthTemplateData(
  displayOrder: number,
  monthDate: Date,
  calendarMonthIndex: number,
): RollingMonthData {
  const monthName = MONTH_ORDER[calendarMonthIndex];

  if (!monthName) {
    throw new Error(
      `Invalid month index: ${calendarMonthIndex}. Expected 0-11.`,
    );
  }

  return {
    displayOrder,
    month: monthName,
    monthNumber: calendarMonthIndex + 1,
    year: monthDate.getFullYear(),
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
 * Creates an empty statistics object when no revenue data exists.
 *
 * @returns RevenueStatistics object with all zero values
 */
export function createEmptyStatistics(): RevenueStatistics {
  return {
    average: 0,
    maximum: 0,
    minimum: 0,
    monthsWithData: 0,
    total: 0,
  };
}

/**
 * Merges actual revenue data with month template to ensure complete 12-month dataset.
 *
 * Uses an efficient lookup strategy with O(1) data retrieval via Map-based lookup
 * and template-driven completion to fill missing months with zero values.
 *
 * @param actualData - Array of actual revenue data from database
 * @param template - Array of 12 month templates
 * @returns Array of 12 complete revenue display entities
 */
export function mergeDataWithTemplate(
  actualData: RevenueDisplayEntity[],
  template: RollingMonthData[],
): RevenueDisplayEntity[] {
  const dataLookup = createDataLookupMap(actualData);

  return template.map((monthTemplate) =>
    getMonthDataOrDefault(monthTemplate, dataLookup),
  );
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
