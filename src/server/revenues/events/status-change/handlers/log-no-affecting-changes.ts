import "server-only";
import { logInfo } from "@/server/revenues/application/cross-cutting/logging";
import type { MetadataWithPeriod } from "@/server/revenues/events/common/types";

export function logNoAffectingChanges(
  context: string,
  meta: MetadataWithPeriod,
): void {
  logInfo(context, "No changes affecting revenue calculation", meta);
}
