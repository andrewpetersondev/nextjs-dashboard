import "server-only";

import { SESSION_COOKIE_NAME } from "@/modules/auth/infrastructure/adapters/session-cookie-adapter.constants";
import { createCookieService } from "@/server/cookies/cookie.factory";
import { isProd } from "@/shared/config/env-shared";
import { MILLISECONDS_PER_SECOND } from "@/shared/constants/time.constants";
import { logger } from "@/shared/logging/infrastructure/logging.client";

const SESSION_COOKIE_HTTPONLY = true as const;
const SESSION_COOKIE_PATH = "/" as const;
const SESSION_COOKIE_SAMESITE = "strict" as const;

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
    const secondsUntilExpiry = Math.floor(
      (expiresAtMs - Date.now()) / MILLISECONDS_PER_SECOND,
    );
    const maxAge = Math.max(0, secondsUntilExpiry);

    await this.cookies.set(SESSION_COOKIE_NAME, value, {
      httpOnly: SESSION_COOKIE_HTTPONLY,
      maxAge,
      path: SESSION_COOKIE_PATH,
      sameSite: SESSION_COOKIE_SAMESITE,
      secure: isProd(),
    });

    logger.debug("Session cookie set", {
      logging: { context: "SessionCookieAdapter.set", expiresAtMs, maxAge },
    });
  }
}

// Factory function for creating adapter instances without singletons
export function createSessionCookieAdapter(): SessionCookieAdapter {
  return new SessionCookieAdapter();
}
