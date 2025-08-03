import "server-only";

import type { RevenueEntity } from "@/db/models/revenue.entity";
import type {
  MonthlyRevenueQueryResult,
  RevenueStatistics,
  RollingMonthData,
} from "@/features/revenues/revenue.types";
import { MONTH_ORDER } from "@/features/revenues/revenue.types";
import { formatMonthDateRange } from "@/features/revenues/revenue-date.utils";
import type { RevenueId } from "@/lib/definitions/brands";

/**
 * Utility functions for data transformation and manipulation related to revenue calculations.
 *
 * This file contains functions for creating, transforming, and manipulating revenue data
 * structures. These functions have been extracted from the RevenueCalculatorService to
 * improve code organization and reusability.
 */

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
  actualData: MonthlyRevenueQueryResult[],
): Map<string, MonthlyRevenueQueryResult> {
  const dataMap = new Map<string, MonthlyRevenueQueryResult>();

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
  dataLookup: Map<string, MonthlyRevenueQueryResult>,
): MonthlyRevenueQueryResult {
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
 * @returns MonthlyRevenueQueryResult with zero values
 */
export function createDefaultMonthData(
  month: string,
  monthNumber: number,
  year: number,
): MonthlyRevenueQueryResult {
  return {
    invoiceCount: 0,
    month,
    monthNumber,
    period: `${year}-${String(monthNumber).padStart(2, "0")}`,
    revenue: 0,
    year,
  } as const;
}

/**
 * Creates default revenue data for a specific period.
 * Centralizes the creation of default revenue records to ensure consistency.
 *
 * @param period - Period in YYYY-MM format
 * @returns Complete revenue data with default values
 */
export function createDefaultRevenueData(
  period: string,
): MonthlyRevenueQueryResult {
  const year = parseInt(period.substring(0, 4), 10);
  const monthNumber = parseInt(period.substring(5, 7), 10);
  const month = String(monthNumber).padStart(2, "0");

  return {
    calculationSource: "invoice_aggregation_rolling_12m",
    createdAt: new Date(),
    id: crypto.randomUUID() as RevenueId,
    invoiceCount: 0,
    month,
    monthNumber,
    period,
    revenue: 0,
    updatedAt: new Date(),
    year,
  } as MonthlyRevenueQueryResult;
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
 * @param data - Monthly revenue query result
 * @param _template - Month template data
 * @param _dateRange - Start and end dates for the month
 * @param timestamp - Creation/update timestamp
 * @param entityId - Unique identifier for the entity
 * @returns Complete RevenueEntity object
 */
export function createRevenueEntityData(
  data: MonthlyRevenueQueryResult,
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
 * @returns Array of 12 complete monthly revenue results
 */
export function mergeDataWithTemplate(
  actualData: MonthlyRevenueQueryResult[],
  template: RollingMonthData[],
): MonthlyRevenueQueryResult[] {
  const dataLookup = createDataLookupMap(actualData);

  return template.map((monthTemplate) =>
    getMonthDataOrDefault(monthTemplate, dataLookup),
  );
}

/**
 * Transforms a monthly query result into a complete revenue entity.
 *
 * Combines query data with template information and adds metadata
 * such as date ranges, timestamps, and unique identifiers.
 *
 * @param data - Monthly revenue data from query or default
 * @param _displayOrder - Order index within the 12-month sequence
 * @param template - Template data containing month metadata
 * @returns Complete RevenueEntity with all required fields
 */
export function transformToRevenueEntity(
  data: MonthlyRevenueQueryResult,
  _displayOrder: number,
  template: RollingMonthData,
): RevenueEntity {
  const dateRange = formatMonthDateRange(template.year, template.monthNumber);
  const baseTimestamp = new Date();
  const entityId = crypto.randomUUID() as RevenueId;

  return createRevenueEntityData(
    data,
    template,
    dateRange,
    baseTimestamp,
    entityId,
  );
}
