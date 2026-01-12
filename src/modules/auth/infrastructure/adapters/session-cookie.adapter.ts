import "server-only";

import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";
import { SESSION_COOKIE_NAME } from "@/modules/auth/infrastructure/adapters/session-cookie-adapter.constants";
import { createCookieService } from "@/server/cookies/cookie.factory";
import { isProd } from "@/shared/config/env-shared";
import { millisecondsToSeconds } from "@/shared/constants/time.constants";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeUnexpectedError } from "@/shared/errors/factories/app-error.factory";
import { logger } from "@/shared/logging/infrastructure/logging.client";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

const SESSION_COOKIE_HTTPONLY = true as const;
const SESSION_COOKIE_PATH = "/" as const;
const SESSION_COOKIE_SAMESITE = "strict" as const;

export class SessionCookieAdapter implements SessionStoreContract {
  private readonly cookies = createCookieService();

  /**
   * Deletes the session cookie, effectively logging out the user.
   */
  async delete(): Promise<Result<void, AppError>> {
    try {
      await this.cookies.delete(SESSION_COOKIE_NAME);
      logger.info("Session cookie deleted", {
        logging: { context: "SessionCookieAdapter.delete" },
      });
      return Ok(undefined);
    } catch (error) {
      logger.error("Failed to delete session cookie", { error });
      return Err(
        makeUnexpectedError(error, { message: "session.store.delete.failed" }),
      );
    }
  }

  /**
   * Retrieves the current session cookie value.
   * @returns The session cookie value, or undefined if not set
   */
  async get(): Promise<Result<string | undefined, AppError>> {
    try {
      const value = await this.cookies.get(SESSION_COOKIE_NAME);
      return Ok(value);
    } catch (error) {
      logger.error("Failed to get session cookie", { error });
      return Err(
        makeUnexpectedError(error, { message: "session.store.get.failed" }),
      );
    }
  }

  /**
   * Sets the session cookie with the provided value and options.
   * @param value - The session token to store
   * @param expiresAtMs - The expiration time in milliseconds since epoch
   */
  async set(
    value: string,
    expiresAtMs: number,
  ): Promise<Result<void, AppError>> {
    try {
      const secondsUntilExpiry = millisecondsToSeconds(
        expiresAtMs - Date.now(),
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

      return Ok(undefined);
    } catch (error) {
      logger.error("Failed to set session cookie", { error });
      return Err(
        makeUnexpectedError(error, { message: "session.store.set.failed" }),
      );
    }
  }
}

// Factory function for creating adapter instances without singletons
export function createSessionCookieAdapter(): SessionCookieAdapter {
  return new SessionCookieAdapter();
}
