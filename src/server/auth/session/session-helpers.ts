import "server-only";
import {
  MAX_ABSOLUTE_SESSION_MS,
  ONE_SECOND_MS,
} from "@/server/auth/session/session.constants";
import type { DecryptPayload } from "@/server/auth/session/session-payload.types";

/** Compute absolute lifetime status from immutable sessionStart. */
export function absoluteLifetime(user?: {
  sessionStart?: number;
  userId?: string;
}): { exceeded: boolean; age: number } {
  const start = user?.sessionStart ?? 0;
  const age = Date.now() - start;
  return { age, exceeded: !start || age > MAX_ABSOLUTE_SESSION_MS };
}

/** Milliseconds remaining until token expiry (negative if expired). */
export function timeLeftMs(payload?: DecryptPayload): number {
  const expMs = (payload?.exp ?? 0) * ONE_SECOND_MS;
  return expMs - Date.now();
}
