import "server-only";
import { ROLLING_COOKIE_MAX_AGE_S } from "@/features/auth/sessions/session.constants";
import {
  SESSION_COOKIE_HTTPONLY,
  SESSION_COOKIE_PATH,
  SESSION_COOKIE_SAMESITE,
  SESSION_COOKIE_SECURE_FALLBACK,
} from "@/server/auth/session/session.constants";
import { IS_PRODUCTION } from "@/server/config/env-next";

export const buildSessionCookieOptions = (expiresAtMs: number) =>
  ({
    expires: new Date(expiresAtMs),
    httpOnly: SESSION_COOKIE_HTTPONLY,
    maxAge: ROLLING_COOKIE_MAX_AGE_S,
    path: SESSION_COOKIE_PATH,
    sameSite: SESSION_COOKIE_SAMESITE,
    secure: IS_PRODUCTION ? true : SESSION_COOKIE_SECURE_FALLBACK,
  }) as const;
