import "server-only";
import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import { getSessionCookieOptionsConfig } from "@/modules/auth/infrastructure/session-cookie/config/session-cookie-options.config";
import { SESSION_COOKIE_NAME } from "@/modules/auth/infrastructure/session-cookie/constants/session-cookie.constants";
import { toSessionCookieMaxAgeSecondsHelper } from "@/modules/auth/infrastructure/session-cookie/helpers/to-session-cookie-max-age-seconds.helper";
import type { CookieContract } from "@/server/cookies/cookie.contract";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeUnexpectedError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Adapter that implements session storage using browser cookies.
 *
 * @remarks
 * This adapter bridges the application-facing {@link SessionStoreContract}
 * with the underlying cookie service implementation.
 */
export class SessionCookieStoreAdapter implements SessionStoreContract {
  private readonly cookies: CookieContract;
  private readonly logger: LoggingClientContract;

  constructor(cookies: CookieContract, logger: LoggingClientContract) {
    this.cookies = cookies;
    this.logger = logger;
  }

  /**
   * Deletes the session cookie, effectively logging out the user.
   */
  async delete(): Promise<Result<void, AppError>> {
    try {
      await this.cookies.delete(SESSION_COOKIE_NAME);
      this.logger.info("Session cookie deleted", {
        logging: { context: "SessionCookieAdapter.delete" },
      });
      return Ok(undefined);
    } catch (error) {
      this.logger.error("Failed to delete session cookie", { error });
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
      this.logger.error("Failed to get session cookie", { error });
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
      const nowMs = Date.now();
      const maxAge = toSessionCookieMaxAgeSecondsHelper(expiresAtMs, nowMs);

      await this.cookies.set(
        SESSION_COOKIE_NAME,
        value,
        getSessionCookieOptionsConfig({ maxAge }),
      );

      this.logger.debug("Session cookie set", {
        logging: { context: "SessionCookieAdapter.set", expiresAtMs, maxAge },
      });

      return Ok(undefined);
    } catch (error) {
      this.logger.error("Failed to set session cookie", { error });
      return Err(
        makeUnexpectedError(error, { message: "session.store.set.failed" }),
      );
    }
  }
}
