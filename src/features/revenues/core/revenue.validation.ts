import type {
  RevenueChartDto,
  RevenueStatisticsDto,
  SimpleRevenueDto,
} from "@/features/revenues/core/revenue.dto";

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
