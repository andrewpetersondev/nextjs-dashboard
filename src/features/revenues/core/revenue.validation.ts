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
    typeof dto.totalAmount === "number" &&
    typeof dto.monthNumber === "number" &&
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
    typeof dto.maximum === "number" &&
    typeof dto.minimum === "number" &&
    typeof dto.average === "number" &&
    typeof dto.total === "number" &&
    typeof dto.monthsWithData === "number" &&
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
    typeof dto.year === "number"
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
    typeof entity.id === "string" &&
    typeof entity.totalAmount === "number" &&
    typeof entity.invoiceCount === "number" &&
    entity.period instanceof Date &&
    typeof entity.calculationSource === "string" &&
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
    typeof displayEntity.month === "string" &&
    typeof displayEntity.year === "number" &&
    typeof displayEntity.monthNumber === "number"
  );
}
