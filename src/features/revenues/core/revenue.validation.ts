import "server-only";

import type {
  RevenueChartDto,
  RevenueStatisticsDto,
  SimpleRevenueDto,
} from "@/features/revenues/core/revenue.dto";
import type {
  RevenueDisplayEntity,
  RevenueEntity,
} from "@/features/revenues/core/revenue.entity";
import {
  MONTH_ORDER,
  type MonthName,
} from "@/features/revenues/core/revenue.types";
import {
  isNonNegativeInteger,
  isNonNegativeNumber,
  isPeriod,
  isRevenueId,
  isRevenueSource,
} from "@/lib/definitions/brands";

/**
 * Type guard to validate SimpleRevenueDto structure.
 *
 * @param value - The value to check
 * @returns True if the value is a valid SimpleRevenueDto
 */
export function isSimpleRevenueDto(value: unknown): value is SimpleRevenueDto {
  if (!value || typeof value !== "object") {
    return false;
  }

  const dto = value as Record<string, unknown>;

  return (
    typeof dto.month === "string" &&
    isNonNegativeNumber(dto.totalAmount) &&
    typeof dto.monthNumber === "number" &&
    Number.isInteger(dto.monthNumber) &&
    dto.monthNumber >= 1 &&
    dto.monthNumber <= 12
  );
}

/**
 * Type guard to validate RevenueStatisticsDto structure.
 *
 * @param value - The value to check
 * @returns True if the value is a valid RevenueStatisticsDto
 */
export function isRevenueStatisticsDto(
  value: unknown,
): value is RevenueStatisticsDto {
  if (!value || typeof value !== "object") {
    return false;
  }

  const dto = value as Record<string, unknown>;

  return (
    isNonNegativeNumber(dto.maximum) &&
    isNonNegativeNumber(dto.minimum) &&
    isNonNegativeNumber(dto.average) &&
    isNonNegativeNumber(dto.total) &&
    typeof dto.monthsWithData === "number" &&
    Number.isInteger(dto.monthsWithData) &&
    dto.monthsWithData >= 0
  );
}

/**
 * Type guard to validate RevenueChartDto structure.
 *
 * @param value - The value to check
 * @returns True if the value is a valid RevenueChartDto
 */
export function isRevenueChartDto(value: unknown): value is RevenueChartDto {
  if (!value || typeof value !== "object") {
    return false;
  }

  const dto = value as Record<string, unknown>;

  return (
    Array.isArray(dto.monthlyData) &&
    dto.monthlyData.every(isSimpleRevenueDto) &&
    isRevenueStatisticsDto(dto.statistics) &&
    typeof dto.year === "number" &&
    Number.isInteger(dto.year)
  );
}

/**
 * Type guard to check if a value is a valid MonthName.
 */
export function isMonthName(value: unknown): value is MonthName {
  return typeof value === "string" && MONTH_ORDER.includes(value as MonthName);
}

/**
 * Type guard to validate RevenueEntity structure.
 *
 * @param value - The value to check
 * @returns True if the value is a valid RevenueEntity
 */
export function isRevenueEntity(value: unknown): value is RevenueEntity {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entity = value as Record<string, unknown>;

  return (
    isRevenueId(entity.id) &&
    isNonNegativeNumber(entity.totalAmount) &&
    isNonNegativeInteger(entity.invoiceCount) &&
    isPeriod(entity.period) &&
    isRevenueSource(entity.calculationSource) &&
    entity.createdAt instanceof Date &&
    entity.updatedAt instanceof Date
  );
}

/**
 * Type guard to validate RevenueDisplayEntity structure.
 *
 * @param value - The value to check
 * @returns True if the value is a valid RevenueDisplayEntity
 */
export function isRevenueDisplayEntity(
  value: unknown,
): value is RevenueDisplayEntity {
  if (!isRevenueEntity(value)) {
    return false;
  }

  const displayEntity = value as unknown as Record<string, unknown>;

  return (
    isMonthName(displayEntity.month) &&
    typeof displayEntity.year === "number" &&
    Number.isInteger(displayEntity.year) &&
    typeof displayEntity.monthNumber === "number" &&
    Number.isInteger(displayEntity.monthNumber) &&
    displayEntity.monthNumber >= 1 &&
    displayEntity.monthNumber <= 12
  );
}
