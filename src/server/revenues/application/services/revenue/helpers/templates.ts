import "server-only";
import { generateMonthsTemplate } from "@/features/revenues/lib/data/template.client";
import { calculateDateRange } from "@/features/revenues/lib/date/range";
import type { RevenueDisplayEntity } from "@/server/revenues/domain/entities/entity.client";
import { toIntervalDuration } from "@/server/revenues/infrastructure/validation/validator";
import { createDefaultRevenueData } from "@/server/revenues/shared/utils/template";
import type { Period } from "@/shared/domain/domain-brands";
import { toPeriod } from "@/shared/domain/id-converters";
import { logger } from "@/shared/logging/logger.shared";

export interface TemplateAndPeriods {
  readonly template: readonly { readonly period: Date }[];
  readonly startPeriod: Period;
  readonly endPeriod: Period;
}

export function buildTemplateAndPeriods(): TemplateAndPeriods {
  const { startDate, endDate, duration } = calculateDateRange();

  logger.info("buildTemplateAndPeriods", { endDate });

  const template = generateMonthsTemplate(
    startDate,
    toIntervalDuration(duration),
  );

  if (template.length === 0) {
    throw new Error("Template generation failed: no months generated");
  }

  const firstMonth = template[0];
  const lastMonth = template.at(-1);
  if (!(firstMonth && lastMonth)) {
    throw new Error("Template generation failed: invalid month data");
  }

  const startDatePeriod = firstMonth.period;
  const endDatePeriod = lastMonth.period;

  return {
    endPeriod: toPeriod(endDatePeriod),
    startPeriod: toPeriod(startDatePeriod),
    template,
  };
}

export function buildDefaultsFromFreshTemplate(): RevenueDisplayEntity[] {
  const { startDate, duration } = calculateDateRange();
  const template = generateMonthsTemplate(
    startDate,
    toIntervalDuration(duration),
  );
  return template.map((t) => createDefaultRevenueData(toPeriod(t.period)));
}
