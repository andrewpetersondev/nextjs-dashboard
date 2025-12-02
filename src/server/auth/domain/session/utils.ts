import "server-only";
import {
  MAX_ABSOLUTE_SESSION_MS,
  ONE_SECOND_MS,
  ROLLING_COOKIE_MAX_AGE_S,
  SESSION_COOKIE_HTTPONLY,
  SESSION_COOKIE_PATH,
  SESSION_COOKIE_SAMESITE,
  SESSION_COOKIE_SECURE_FALLBACK,
} from "@/server/auth/domain/session/constants";
import { isProd } from "@/shared/infrastructure/config/env-shared";

/** Compute absolute lifetime status from immutable sessionStart. */
export function absoluteLifetime(user?: {
  sessionStart?: number;
  userId?: string;
}): { exceeded: boolean; age: number } {
  const start = user?.sessionStart ?? 0;
  const age = Date.now() - start;
  return { age, exceeded: !start || age > MAX_ABSOLUTE_SESSION_MS };
}

/**
 * Milliseconds remaining until token expiry (negative if expired).
 *
 * Refactored to support the new flat JWT claims shape. Prefers `expiresAt`
 * (milliseconds) when present; falls back to `exp` (seconds) for legacy callers.
 */
export function timeLeftMs(payload?: {
  expiresAt?: number;
  exp?: number;
}): number {
  if (payload?.expiresAt && Number.isFinite(payload.expiresAt)) {
    return payload.expiresAt - Date.now();
  }
  const expMs = (payload?.exp ?? 0) * ONE_SECOND_MS;
  return expMs - Date.now();
}

export const buildSessionCookieOptions = (expiresAtMs: number) =>
  ({
    expires: new Date(expiresAtMs),
    httpOnly: SESSION_COOKIE_HTTPONLY,
    maxAge: ROLLING_COOKIE_MAX_AGE_S,
    path: SESSION_COOKIE_PATH,
    sameSite: SESSION_COOKIE_SAMESITE,
    secure: isProd() ? true : SESSION_COOKIE_SECURE_FALLBACK,
  }) as const;
