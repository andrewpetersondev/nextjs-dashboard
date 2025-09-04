import "server-only";

import { logInfo } from "@/server/revenues/events/logging";
import type { MetadataWithPeriod } from "../types";

export function logNoAffectingChanges(
  context: string,
  meta: MetadataWithPeriod,
): void {
  logInfo(context, "No changes affecting revenue calculation", meta);
}
