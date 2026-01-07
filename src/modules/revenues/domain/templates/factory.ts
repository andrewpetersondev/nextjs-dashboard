import type { RevenueEntity } from "@/modules/revenues/domain/entities/revenue.entity";
import type { RevenueDisplayEntity } from "@/modules/revenues/domain/entities/revenue-display.entity";
import { createRevenueDisplayEntity } from "@/modules/revenues/domain/factories/revenue-display.factory";
import { MONTH_ORDER } from "@/modules/revenues/domain/revenue.constants";
import type { RollingMonthData } from "@/modules/revenues/domain/revenue.types";
import type { Period } from "@/shared/branding/brands";
import {
  toPeriod,
  toRevenueId,
} from "@/shared/branding/converters/id-converters";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

/**
 * Internal helper: construct a default RevenueEntity for a given period.
 * DRY: used by default month and default period creators.
 */
function makeDefaultRevenueEntity(p: Period): RevenueEntity {
  return {
    calculationSource: "template",
    createdAt: new Date(),
    id: toRevenueId(crypto.randomUUID()),
    invoiceCount: 0,
    period: toPeriod(p),
    totalAmount: 0,
    totalPaidAmount: 0,
    totalPendingAmount: 0,
    updatedAt: new Date(),
  };
}

/**
 * Creates month template data with validated month name lookup.
 * Client-safe equivalent for features.
 * @param calendarMonthIndex - Calendar month index (0-11).
 * @param displayOrder - Display order index.
 * @param monthDate - Date for the month.
 * @returns RollingMonthData object.
 */
export function createMonthTemplateData(
  displayOrder: number,
  monthDate: Date,
  calendarMonthIndex: number,
): RollingMonthData {
  const monthName = MONTH_ORDER[calendarMonthIndex];
  if (!monthName) {
    throw makeAppError(APP_ERROR_KEYS.validation, {
      cause: "",
      message: `Invalid month index: ${calendarMonthIndex}. Expected 0-11.`,
      metadata: {},
    });
  }

  const monthNumber = calendarMonthIndex + 1;
  const period = toPeriod(
    `${monthDate.getFullYear()}-${String(monthNumber).padStart(2, "0")}`,
  );
  const year = monthDate.getFullYear();

  return {
    displayOrder,
    month: monthName,
    monthNumber,
    period,
    year,
  };
}

/**
 * Creates a default revenue display entity for a specific period.
 * This function creates a RevenueDisplayEntity object by first creating a default
 * RevenueEntity and then transforming it using the factory method.
 * Use createDefaultRevenueEntity if you need a database-compatible entity.
 * @param period - Branded Period (first-of-month Date).
 * @returns Complete RevenueDisplayEntity with default values.
 */
export function createDefaultRevenueData(period: Period): RevenueDisplayEntity {
  // Create a default RevenueEntity
  const defaultEntity: RevenueEntity = makeDefaultRevenueEntity(period);

  // Transform to RevenueDisplayEntity using the factory method
  return createRevenueDisplayEntity(defaultEntity);
}
