import "server-only";

import type { SessionStoreContract } from "@/modules/auth/server/application/types/contracts/session-store.contract";
import type { SessionTokenCodecContract } from "@/modules/auth/server/application/types/contracts/session-token-codec.contract";
import type { SessionPrincipalDto } from "@/modules/auth/server/application/types/dtos/session-principal.dto";
import { ClearSessionUseCase } from "@/modules/auth/server/application/use-cases/session/clear-session.use-case";
import { EstablishSessionUseCase } from "@/modules/auth/server/application/use-cases/session/establish-session.use-case";
import { ReadSessionUseCase } from "@/modules/auth/server/application/use-cases/session/read-session.use-case";
import { RotateSessionUseCase } from "@/modules/auth/server/application/use-cases/session/rotate-session.use-case";
import type { UpdateSessionOutcome } from "@/modules/auth/shared/domain/session/session.policy";
import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
import type { Result } from "@/shared/results/result.types";

/**
 * Manages session lifecycle including establishment, rotation, and cleanup.
 *
 * Handles rolling session behavior with a 15-minute idle timeout and 30-day absolute limit.
 * Uses Result pattern for error handling and JWT tokens stored in secure cookies.
 *
 * @example
 * const manager = new SessionManager(cookieAdapter, jwtCodec, logger);
 * const result = await manager.establish({ id: userId, role: "admin" });
 */
export class SessionService {
  private readonly cookie: SessionStoreContract;
  private readonly jwt: SessionTokenCodecContract;
  private readonly logger: LoggingClientPort;

  constructor(
    cookie: SessionStoreContract,
    jwt: SessionTokenCodecContract,
    logger: LoggingClientPort,
  ) {
    this.cookie = cookie;
    this.jwt = jwt;
    this.logger = logger.child({ scope: "service" });
  }

  /**
   * Clears the current session by deleting the cookie.
   *
   * @returns Result with void on success, or AppError on failure
   */
  async clear(): Promise<Result<void, AppError>> {
    return await new ClearSessionUseCase({
      cookie: this.cookie,
      logger: this.logger,
    }).execute();
  }

  /**
   * Establishes a new session for the given user.
   *
   * Delegates to the EstablishSessionUseCase (single-capability verb).
   */
  async establish(
    user: SessionPrincipalDto,
  ): Promise<Result<SessionPrincipalDto, AppError>> {
    const useCase = new EstablishSessionUseCase({
      cookie: this.cookie,
      jwt: this.jwt,
      logger: this.logger,
    });

    return await useCase.execute(user);
  }

  /**
   * Reads the current session from the cookie.
   *
   * Decodes the JWT token and extracts user role and id.
   * Returns undefined if no valid session exists.
   *
   * @returns Object with role and userId, or undefined if no session
   */
  async read(): Promise<{ role: UserRole; userId: UserId } | undefined> {
    return await new ReadSessionUseCase({
      cookie: this.cookie,
      jwt: this.jwt,
      logger: this.logger,
    }).execute();
  }

  /**
   * Rotates the session token if necessary based on refresh threshold.
   *
   * - Returns `Ok(outcome)` for expected policy outcomes (including "not rotated").
   * - Returns `Err(AppError)` for operational failures (token issue/cookie write/unexpected).
   */
  async rotate(): Promise<Result<UpdateSessionOutcome, AppError>> {
    return await new RotateSessionUseCase({
      cookie: this.cookie,
      jwt: this.jwt,
      logger: this.logger,
    }).execute();
  }
}
