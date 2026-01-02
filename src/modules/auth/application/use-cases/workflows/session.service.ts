import "server-only";

import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import type { SessionTokenCodecContract } from "@/modules/auth/application/contracts/session-token-codec.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import { EstablishSessionCommand } from "@/modules/auth/application/use-cases/commands/establish-session.command";
import { RotateSessionCommand } from "@/modules/auth/application/use-cases/commands/rotate-session.command";
import {
  TerminateSessionCommand,
  type TerminateSessionReason,
} from "@/modules/auth/application/use-cases/commands/terminate-session.command";
import { GetSessionQuery } from "@/modules/auth/application/use-cases/queries/get-session.query";
import {
  VerifySessionQuery,
  type VerifySessionResult,
} from "@/modules/auth/application/use-cases/queries/verify-session.query";
import type { UpdateSessionOutcome } from "@/modules/auth/domain/policies/session.policy";
import { SessionTokenService } from "@/modules/auth/infrastructure/cryptography/session-token.service";
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
    return new EstablishSessionCommand({
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
    return new RotateSessionCommand({
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
    return new TerminateSessionCommand({
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
