"use server";

import {
  MAX_MONTH_NUMBER,
  MIN_MONTH_NUMBER,
} from "@/features/revenues/lib/date/constants";
import { getDB } from "@/server/db/connection";
import { serverLogger } from "@/server/logging/serverLogger";
import type {
  RevenueChartDto,
  RevenueStatisticsDto,
} from "@/server/revenues/dto";
import { RevenueRepository } from "@/server/revenues/repository";
import { RevenueStatisticsService } from "@/server/revenues/services/revenue-statistics.service";
import type { RevenueActionResult } from "@/server/revenues/types";
import { convertCentsToDollars } from "@/shared/money/convert";
import {
  MONTH_ORDER,
  type MonthName,
  type SimpleRevenueDto,
} from "@/shared/revenues/types";

// Small helpers to keep getRevenueChartAction concise
function validateMonthNumber(monthNumber: number, period: Date): void {
  if (monthNumber < MIN_MONTH_NUMBER || monthNumber > MAX_MONTH_NUMBER) {
    throw new Error(`Invalid month number ${monthNumber} in period ${period}`);
  }
}

function monthAbbreviationFromNumber(monthNumber: number): MonthName {
  const abbr = MONTH_ORDER[monthNumber - 1];
  if (!abbr) {
    throw new Error(
      `Failed to get month abbreviation for month number ${monthNumber}`,
    );
  }
  return abbr;
}

function mapEntityToSimpleRevenueDto(
  entity: { period: Date; totalAmount: number },
  index: number,
): SimpleRevenueDto {
  const monthNumber = entity.period.getUTCMonth() + 1;
  validateMonthNumber(monthNumber, entity.period);
  const month = monthAbbreviationFromNumber(monthNumber);
  return {
    month,
    monthNumber: index + 1,
    totalAmount: convertCentsToDollars(entity.totalAmount),
  };
}

function toStatisticsDto(raw: {
  average: number;
  maximum: number;
  minimum: number;
  monthsWithData: number;
  total: number;
}): RevenueStatisticsDto {
  return {
    average: convertCentsToDollars(raw.average),
    maximum: convertCentsToDollars(raw.maximum),
    minimum: convertCentsToDollars(raw.minimum),
    monthsWithData: raw.monthsWithData,
    total: convertCentsToDollars(raw.total),
  };
}

/**
 * Retrieves complete revenue chart data for the last 12 months with statistical metrics.
 *
 * @returns Promise resolving to RevenueActionResult containing chart data or error
 *
 * @throws {Error} When database connection fails
 * @throws {Error} When revenue calculation service encounters errors
 * @throws {Error} When data transformation fails
 *
 */
export async function getRevenueChartAction(): Promise<
  RevenueActionResult<RevenueChartDto>
> {
  try {
    const repository = new RevenueRepository(getDB());
    const service = new RevenueStatisticsService(repository);

    const [entities, rawStatistics] = await Promise.all([
      service.calculateForRollingYear(),
      service.calculateStatistics(),
    ]);

    const monthlyData = entities.map(mapEntityToSimpleRevenueDto);
    const statistics = toStatisticsDto(rawStatistics);

    return {
      data: {
        monthlyData,
        statistics,
        year: new Date().getFullYear(),
      },
      success: true,
    };
  } catch (error) {
    serverLogger.error({
      error,
      message: "Get revenue chart action error (rolling 12 months)",
    });
    return { error: "Failed to fetch chart data", success: false };
  }
}
