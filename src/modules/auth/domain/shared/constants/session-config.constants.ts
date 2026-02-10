/** biome-ignore-all lint/style/noMagicNumbers: <ok in this file> */
import type { DurationSeconds } from "@/modules/auth/domain/session/value-objects/auth-brands.value";
import { toDurationSeconds } from "@/modules/auth/domain/session/value-objects/time.value";

/** Session duration (15 minutes) */
export const SESSION_DURATION_SEC: DurationSeconds = toDurationSeconds(900);

/** Threshold for triggering session rotation (2 minutes) */
export const SESSION_REFRESH_THRESHOLD_SEC: DurationSeconds =
  toDurationSeconds(120);

/** Maximum absolute session lifetime (30 days) */
export const MAX_ABSOLUTE_SESSION_SEC: DurationSeconds =
  toDurationSeconds(2_592_000);
