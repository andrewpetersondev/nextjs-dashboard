import "server-only";
import { generateMonthsTemplate } from "@/modules/revenues/domain/data/template.client";
import { calculateDateRange } from "@/modules/revenues/domain/date/range";
import { createDefaultRevenueData } from "@/modules/revenues/server/application/utils/template";
import type { RevenueDisplayEntity } from "@/modules/revenues/server/domain/entities/entity.client";
import { toIntervalDuration } from "@/modules/revenues/server/infrastructure/mappers/interval-duration.mapper";
import type { Period } from "@/shared/branding/brands";
import { toPeriod } from "@/shared/branding/converters/id-converters";

export interface TemplateAndPeriods {
  readonly endPeriod: Period;
  readonly startPeriod: Period;
  readonly template: readonly { readonly period: Date }[];
}

export function buildTemplateAndPeriods(): TemplateAndPeriods {
  const { startDate, duration } = calculateDateRange();

  const durationResult = toIntervalDuration(duration);
  if (!durationResult.ok) {
    throw new Error("Invalid interval duration");
  }

  const template = generateMonthsTemplate(startDate, durationResult.value);

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

  const durationResult = toIntervalDuration(duration);
  if (!durationResult.ok) {
    throw new Error("Invalid interval duration");
  }

  const template = generateMonthsTemplate(startDate, durationResult.value);
  return template.map((t) => createDefaultRevenueData(toPeriod(t.period)));
}
