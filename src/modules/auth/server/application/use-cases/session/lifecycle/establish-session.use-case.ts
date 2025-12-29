import "server-only";

import type { SessionTokenService } from "@/modules/auth/server/application/services/session-token.service";
import type { SessionStoreContract } from "@/modules/auth/server/application/types/contracts/session-store.contract";
import type { SessionPrincipalDto } from "@/modules/auth/server/application/types/dtos/session-principal.dto";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { normalizeUnknownToAppError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

export type EstablishSessionDeps = Readonly<{
  logger: LoggingClientPort;
  store: SessionStoreContract;
  tokenService: SessionTokenService;
}>;

/**
 * EstablishSessionUseCase
 *
 * Single-capability application use-case:
 * - Issue a new session token via SessionTokenService
 * - Persist it via SessionStoreContract
 */
export class EstablishSessionUseCase {
  private readonly logger: LoggingClientPort;
  private readonly store: SessionStoreContract;
  private readonly tokenService: SessionTokenService;

  constructor(deps: EstablishSessionDeps) {
    this.logger = deps.logger.child({
      scope: "use-case",
      useCase: "establishSession",
    });
    this.store = deps.store;
    this.tokenService = deps.tokenService;
  }

  async execute(
    user: SessionPrincipalDto,
  ): Promise<Result<SessionPrincipalDto, AppError>> {
    try {
      const now = Date.now();

      const issuedResult = await this.tokenService.issue({
        role: user.role,
        sessionStart: now,
        userId: user.id,
      });

      if (!issuedResult.ok) {
        return Err(issuedResult.error);
      }

      const { expiresAtMs, token } = issuedResult.value;

      await this.store.set(token, expiresAtMs);

      this.logger.operation("info", "Session established", {
        operationContext: "session",
        operationIdentifiers: {
          expiresAt: expiresAtMs,
          role: user.role,
          sessionStart: now,
          userId: user.id,
        },
        operationName: "session.establish.success",
      });

      return Ok(user);
    } catch (err: unknown) {
      return Err(normalizeUnknownToAppError(err, "unexpected"));
    }
  }
}
