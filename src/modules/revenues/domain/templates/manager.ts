import "server-only";
import type { RevenueDisplayEntity } from "@/modules/revenues/domain/entities/revenue-display.entity";
import { createDefaultRevenueData } from "@/modules/revenues/domain/templates/factory";
import { generateMonthsTemplate } from "@/modules/revenues/domain/templates/generator";
import { toIntervalDuration } from "@/modules/revenues/domain/time/interval-duration.mapper";
import { calculateDateRange } from "@/modules/revenues/domain/time/range";
import type {
  RollingMonthData,
  TemplateAndPeriods,
} from "@/modules/revenues/domain/types";
import { toPeriod } from "@/shared/branding/converters/id-converters";
import { makeValidationError } from "@/shared/errors/factories/app-error.factory";

/**
 * Private helper to compute the validated template.
 * @returns The generated template.
 */
function getValidatedTemplate(): readonly RollingMonthData[] {
  const { duration, startDate } = calculateDateRange();

  const durationResult = toIntervalDuration(duration);
  if (!durationResult.ok) {
    throw makeValidationError({
      cause: "",
      message: "Invalid interval duration",
      metadata: { duration, startDate },
    });
  }

  const template = generateMonthsTemplate(startDate, durationResult.value);

  if (template.length === 0) {
    throw makeValidationError({
      cause: "",
      message: "Template generation failed: no months generated",
      metadata: { duration: durationResult.value, startDate },
    });
  }

  return template;
}

/**
 * Builds a template and periods for the revenue dashboard.
 * @returns The template and associated periods.
 */
export function buildTemplateAndPeriods(): TemplateAndPeriods {
  const template = getValidatedTemplate();

  const firstMonth = template[0];
  const lastMonth = template.at(-1);
  if (!(firstMonth && lastMonth)) {
    throw makeValidationError({
      cause: "",
      message: "Template generation failed: invalid month data",
      metadata: { template },
    });
  }

  const endDatePeriod = lastMonth.period;
  const startDatePeriod = firstMonth.period;

  return {
    endPeriod: toPeriod(endDatePeriod),
    startPeriod: toPeriod(startDatePeriod),
    template,
  };
}

/**
 * Builds default revenue display entities from a fresh template.
 * @returns Array of default revenue display entities.
 */
export function buildDefaultsFromFreshTemplate(): RevenueDisplayEntity[] {
  const template = getValidatedTemplate();
  return template.map((t) => createDefaultRevenueData(toPeriod(t.period)));
}

/**
 * Merges existing revenue display entities with a template, filling gaps with defaults.
 * @param displayEntities - Existing revenue display entities.
 * @param template - The rolling month template.
 * @returns Merged array of revenue display entities.
 */
export function mergeWithTemplate(
  template: readonly RollingMonthData[],
  displayEntities: readonly RevenueDisplayEntity[],
): RevenueDisplayEntity[] {
  const dataLookup = new Map<number, RevenueDisplayEntity>(
    displayEntities.map((e) => [e.period.getTime(), e] as const),
  );
  return template.map(
    (t) =>
      dataLookup.get(t.period.getTime()) ??
      createDefaultRevenueData(toPeriod(t.period)),
  );
}
