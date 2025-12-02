import "server-only";
import { logInfo } from "@/modules/revenues/server/application/cross-cutting/logging";
import type { MetadataWithPeriod } from "@/modules/revenues/server/events/handlers/core/types";

export function logNoAffectingChanges(
  context: string,
  meta: MetadataWithPeriod,
): void {
  logInfo(context, "No changes affecting revenue calculation", meta);
}
