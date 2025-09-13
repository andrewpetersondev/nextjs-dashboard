import "server-only";

import { generateMonthsTemplate } from "@/features/revenues/lib/data/template.client";
import { calculateDateRange } from "@/features/revenues/lib/date/range";
import { serverLogger } from "@/server/logging/serverLogger";
import type { RevenueDisplayEntity } from "@/server/revenues/domain/entities/entity";
import { toIntervalDuration } from "@/server/revenues/infrastructure/validation/validator";
import { createDefaultRevenueData } from "@/server/revenues/shared/utils/template";
import type { Period } from "@/shared/domain/domain-brands";
import { toPeriod } from "@/shared/domain/id-converters";

export interface TemplateAndPeriods {
  readonly template: readonly { readonly period: Date }[];
  readonly startPeriod: Period;
  readonly endPeriod: Period;
}

export function buildTemplateAndPeriods(): TemplateAndPeriods {
  const { startDate, endDate, duration } = calculateDateRange();
  serverLogger.debug({
    context: "RevenueStatisticsService.calculateForRollingYear",
    duration,
    endDate,
    message: "Calculated date range for a rolling 12-month period",
    startDate,
  });

  const template = generateMonthsTemplate(
    startDate,
    toIntervalDuration(duration),
  );

  if (template.length === 0) {
    throw new Error("Template generation failed: no months generated");
  }

  const firstMonth = template[0];
  const lastMonth = template[template.length - 1];
  if (!firstMonth || !lastMonth) {
    throw new Error("Template generation failed: invalid month data");
  }

  const startDatePeriod = firstMonth.period;
  const endDatePeriod = lastMonth.period;

  serverLogger.debug({
    context: "RevenueStatisticsService.calculateForRollingYear",
    endPeriod: endDatePeriod,
    message: "Prepared template for a 12-month period",
    startPeriod: startDatePeriod,
    templateMonths: template.length,
  });

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
