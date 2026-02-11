import "server-only";
import type { SessionStoreContract } from "@/modules/auth/application/session/contracts/session-store.contract";
import { getSessionCookieOptionsConfig } from "@/modules/auth/infrastructure/session/config/session-cookie-options.config";
import { toSessionCookieMaxAgeSecondsHelper } from "@/modules/auth/infrastructure/session/helpers/to-session-cookie-max-age-seconds.helper";
import { SESSION_COOKIE_NAME } from "@/modules/auth/infrastructure/session/types/session-cookie.constants";
import type { CookieContract } from "@/server/cookies/cookie.contract";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { makeUnexpectedError } from "@/shared/core/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/results/result";
import type { Result } from "@/shared/core/results/result.types";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";

/**
 * Adapter that implements session storage using browser cookies.
 *
 * @remarks
 * This adapter bridges the application-facing {@link SessionStoreContract}
 * with the underlying cookie service implementation.
 *
 * @implements {SessionStoreContract}
 */
export class SessionCookieStoreAdapter implements SessionStoreContract {
  private readonly cookies: CookieContract;
  private readonly logger: LoggingClientContract;

  /**
   * Initializes the session cookie store adapter.
   *
   * @param cookies - The cookie management contract.
   * @param logger - The logging client.
   */
  constructor(cookies: CookieContract, logger: LoggingClientContract) {
    this.cookies = cookies;
    this.logger = logger;
  }

  /**
   * Deletes the session cookie, effectively logging out the user.
   *
   * @returns A promise resolving to a {@link Result} indicating success or containing an {@link AppError}.
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
   *
   * @returns A promise resolving to a {@link Result} containing the session cookie value, or undefined if not set.
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
   *
   * @param value - The session token to store.
   * @param expiresAtMs - The expiration time in milliseconds since epoch.
   * @returns A promise resolving to a {@link Result} indicating success or containing an {@link AppError}.
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
