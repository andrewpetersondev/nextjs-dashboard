import "server-only";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
} from "@/modules/auth/domain/session/session.constants";
import { createCookieService } from "@/server/cookies/cookie.factory";
import { isProd } from "@/shared/config/env-shared";
import { logger } from "@/shared/logging/infrastructure/logging.client";

const ONE_SECOND_MS = 1000 as const;

const SESSION_COOKIE_HTTPONLY = true as const;
const SESSION_COOKIE_PATH = "/" as const;
const SESSION_COOKIE_SAMESITE = "lax" as const;

const FIXED_MAX_AGE_S = Math.floor(SESSION_DURATION_MS / ONE_SECOND_MS);

export class SessionCookieAdapter {
  private readonly cookies = createCookieService();

  /**
   * Deletes the session cookie, effectively logging out the user.
   */
  async delete(): Promise<void> {
    await this.cookies.delete(SESSION_COOKIE_NAME);
    logger.info("Session cookie deleted", {
      logging: { context: "SessionCookieAdapter.delete" },
    });
  }

  /**
   * Retrieves the current session cookie value.
   * @returns The session cookie value, or undefined if not set
   */
  async get(): Promise<string | undefined> {
    return await this.cookies.get(SESSION_COOKIE_NAME);
  }

  /**
   * Sets the session cookie with the provided value and options.
   * @param value - The session token to store
   * @param expiresAtMs - The expiration time in milliseconds since epoch
   */
  async set(value: string, expiresAtMs: number): Promise<void> {
    await this.cookies.set(SESSION_COOKIE_NAME, value, {
      expires: new Date(expiresAtMs),
      httpOnly: SESSION_COOKIE_HTTPONLY,
      maxAge: FIXED_MAX_AGE_S,
      path: SESSION_COOKIE_PATH,
      sameSite: SESSION_COOKIE_SAMESITE,
      secure: isProd(),
    });

    logger.debug("Session cookie set", {
      logging: { context: "SessionCookieAdapter.set" },
    });
  }
}

// Factory function for creating adapter instances without singletons
export function createSessionCookieAdapter(): SessionCookieAdapter {
  return new SessionCookieAdapter();
}
