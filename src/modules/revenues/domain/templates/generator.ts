import type { IntervalDuration } from "@/modules/revenues/domain/constants";
import {
  createMonthTemplateFromIndex,
  getIntervalCount,
} from "@/modules/revenues/domain/time/range";
import type { RollingMonthData } from "@/modules/revenues/domain/types";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

/**
 * Generates a template for the rolling period based on the start date and period type.
 * @param duration - The period type ('year' or 'month').
 * @param startDate - The start date.
 * @returns Array of RollingMonthData objects for the specified period.
 * @throws Error if interval count is invalid or template generation fails.
 */
export function generateMonthsTemplate(
  startDate: Date,
  duration: IntervalDuration,
): RollingMonthData[] {
  const intervalCount = getIntervalCount(duration);

  if (intervalCount <= 0) {
    throw makeAppError(APP_ERROR_KEYS.validation, {
      cause: "",
      message: `Invalid interval count: ${intervalCount}`,
      metadata: {},
    });
  }

  const template = Array.from({ length: intervalCount }, (_, index) => {
    return createMonthTemplateFromIndex(startDate, index);
  });

  if (template.length === 0) {
    throw makeAppError(APP_ERROR_KEYS.validation, {
      cause: "",
      message: "Failed to generate a template: an empty array created",
      metadata: {},
    });
  }

  return template;
}
