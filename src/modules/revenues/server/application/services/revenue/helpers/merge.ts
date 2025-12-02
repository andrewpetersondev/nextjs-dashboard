import "server-only";
import { createDefaultRevenueData } from "@/modules/revenues/server/application/utils/template";
import type { RevenueDisplayEntity } from "@/modules/revenues/server/domain/entities/entity.client";
import { toPeriod } from "@/shared/branding/converters/id-converters";

export function mergeWithTemplate(
  template: readonly { readonly period: Date }[],
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
