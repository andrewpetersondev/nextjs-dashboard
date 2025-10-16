import "server-only";
import {
  MAX_ABSOLUTE_SESSION_MS,
  ONE_SECOND_MS,
} from "@/features/auth/sessions/session.constants";
import type { DecryptPayload } from "@/server/auth/session/session-payload.types";

/** Internal: compute absolute lifetime status. */
export function absoluteLifetime(user?: {
  sessionStart?: number;
  userId?: string;
}): {
  exceeded: boolean;
  age: number;
} {
  const start = user?.sessionStart ?? 0;
  const age = Date.now() - start;
  return { age, exceeded: !start || age > MAX_ABSOLUTE_SESSION_MS };
}

/** Internal: compute remaining time before token expiry in ms. */
export function timeLeftMs(payload?: DecryptPayload): number {
  const expMs = (payload?.exp ?? 0) * ONE_SECOND_MS;
  return expMs - Date.now();
}
