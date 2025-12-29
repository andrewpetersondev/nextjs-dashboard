import "server-only";

import { SessionTokenService } from "@/modules/auth/server/application/services/session-token.service";
import type { SessionStoreContract } from "@/modules/auth/server/application/types/contracts/session-store.contract";
import type { SessionTokenCodecContract } from "@/modules/auth/server/application/types/contracts/session-token-codec.contract";
import type { SessionPrincipalDto } from "@/modules/auth/server/application/types/dtos/session-principal.dto";
import { EstablishSessionUseCase } from "@/modules/auth/server/application/use-cases/session/lifecycle/establish-session.use-case";
import { RotateSessionUseCase } from "@/modules/auth/server/application/use-cases/session/lifecycle/rotate-session.use-case";
import {
  type TerminateSessionReason,
  TerminateSessionUseCase,
} from "@/modules/auth/server/application/use-cases/session/lifecycle/terminate-session.use-case";
import { ReadSessionUseCase } from "@/modules/auth/server/application/use-cases/session/queries/read-session.use-case";
import type { UpdateSessionOutcome } from "@/modules/auth/shared/domain/session/session.policy";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
import type { Result } from "@/shared/results/result.types";

/**
 * Orchestrates session lifecycle operations.
 *
 * Delegates to specialized use cases for each operation.
 * Uses SessionTokenService for token concerns.
 */
export class SessionService {
  private readonly logger: LoggingClientPort;
  private readonly store: SessionStoreContract;
  private readonly tokenService: SessionTokenService;

  constructor(
    store: SessionStoreContract,
    codec: SessionTokenCodecContract,
    logger: LoggingClientPort,
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
    return new ReadSessionUseCase({
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
}
