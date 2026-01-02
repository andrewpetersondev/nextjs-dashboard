import "server-only";

import { EstablishSessionUseCase } from "@/modules/auth/application/commands/establish-session.use-case";
import { RotateSessionUseCase } from "@/modules/auth/application/commands/rotate-session.use-case";
import {
  type TerminateSessionReason,
  TerminateSessionUseCase,
} from "@/modules/auth/application/commands/terminate-session.use-case";
import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import type { SessionTokenCodecContract } from "@/modules/auth/application/contracts/session-token-codec.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import { GetSessionQuery } from "@/modules/auth/application/queries/get-session.query";
import {
  VerifySessionQuery,
  type VerifySessionResult,
} from "@/modules/auth/application/queries/verify-session.query";
import { SessionTokenService } from "@/modules/auth/application/services/session-token.service";
import type { UpdateSessionOutcome } from "@/modules/auth/domain/policies/session.policy";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import type { Result } from "@/shared/results/result.types";

/**
 * Orchestrates session lifecycle operations.
 *
 * Delegates to specialized use cases for each operation.
 * Uses SessionTokenService for token concerns.
 */
export class SessionService {
  private readonly logger: LoggingClientContract;
  private readonly store: SessionStoreContract;
  private readonly tokenService: SessionTokenService;

  constructor(
    store: SessionStoreContract,
    codec: SessionTokenCodecContract,
    logger: LoggingClientContract,
  ) {
    this.logger = logger.child({ scope: "service" });
    this.store = store;
    this.tokenService = new SessionTokenService(codec);
  }

  /**
   * Establishes a new session for the given user.
   */
  establish(
    user: SessionPrincipalDto,
  ): Promise<Result<SessionPrincipalDto, AppError>> {
    return new EstablishSessionUseCase({
      logger: this.logger,
      store: this.store,
      tokenService: this.tokenService,
    }).execute(user);
  }

  /**
   * Reads the current session from the cookie.
   */
  read(): Promise<Result<SessionPrincipalDto | undefined, AppError>> {
    return new GetSessionQuery({
      logger: this.logger,
      store: this.store,
      tokenService: this.tokenService,
    }).execute();
  }

  /**
   * Rotates the session token if necessary based on refresh threshold.
   */
  rotate(): Promise<Result<UpdateSessionOutcome, AppError>> {
    return new RotateSessionUseCase({
      logger: this.logger,
      store: this.store,
      tokenService: this.tokenService,
    }).execute();
  }

  /**
   * Terminates the current session.
   */
  terminate(
    reason: TerminateSessionReason = "user_logout",
  ): Promise<Result<void, AppError>> {
    return new TerminateSessionUseCase({
      logger: this.logger,
      store: this.store,
    }).execute(reason);
  }

  /**
   * Verifies the current session without side effects.
   */
  verify(): Promise<VerifySessionResult> {
    return new VerifySessionQuery({
      logger: this.logger,
      store: this.store,
      tokenService: this.tokenService,
    }).execute();
  }
}
