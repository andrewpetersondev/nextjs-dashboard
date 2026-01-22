import "server-only";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import {
  SESSION_COOKIE_HTTPONLY,
  SESSION_COOKIE_PATH,
  SESSION_COOKIE_SAMESITE,
} from "@/modules/auth/infrastructure/cookies/constants/session-cookie.constants";
import { isProd } from "@/shared/config/env-shared";

/**
 * Session cookie options policy.
 *
 * @remarks
 * Centralizes cookie security and scoping decisions (SameSite, Secure, Path, HttpOnly)
 * so the adapter only coordinates storage operations.
 */
export function getSessionCookieOptionsPolicy(input: {
  readonly maxAge: number;
}): Partial<ResponseCookie> {
  return {
    httpOnly: SESSION_COOKIE_HTTPONLY,
    maxAge: input.maxAge,
    path: SESSION_COOKIE_PATH,
    sameSite: SESSION_COOKIE_SAMESITE,
    secure: isProd(),
  };
}
