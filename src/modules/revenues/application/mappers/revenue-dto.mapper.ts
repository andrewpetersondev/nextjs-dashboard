import "server-only";
import {
  monthAbbreviationFromNumber,
  validateMonthNumber,
} from "@/modules/revenues/domain/time/months";
import type {
  RevenueStatisticsDto,
  SimpleRevenueDto,
} from "@/modules/revenues/domain/types";
import { convertCentsToDollars } from "@/shared/utilities/money/convert";

export function mapEntityToSimpleRevenueDto(
  entity: {
    period: Date;
    totalAmount: number;
    totalPaidAmount: number;
    totalPendingAmount: number;
  },
  index: number,
): SimpleRevenueDto {
  const monthNumber = entity.period.getUTCMonth() + 1;
  validateMonthNumber(monthNumber, entity.period);
  const month = monthAbbreviationFromNumber(monthNumber);
  return {
    month,
    monthNumber: index + 1,
    totalAmount: convertCentsToDollars(entity.totalAmount),
    totalPaidAmount: convertCentsToDollars(entity.totalPaidAmount),
    totalPendingAmount: convertCentsToDollars(entity.totalPendingAmount),
  };
}

export function mapToStatisticsDto(raw: {
  readonly average: number;
  readonly maximum: number;
  readonly minimum: number;
  readonly monthsWithData: number;
  readonly total: number;
}): RevenueStatisticsDto {
  return {
    average: convertCentsToDollars(raw.average),
    maximum: convertCentsToDollars(raw.maximum),
    minimum: convertCentsToDollars(raw.minimum),
    monthsWithData: raw.monthsWithData,
    total: convertCentsToDollars(raw.total),
  };
}
