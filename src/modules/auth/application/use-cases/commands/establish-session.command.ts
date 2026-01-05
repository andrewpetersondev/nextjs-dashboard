import "server-only";

import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-deps.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";
import type { SessionTokenAdapter } from "@/modules/auth/infrastructure/adapters/session-token.adapter";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { normalizeUnknownToAppError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * EstablishSessionUseCase
 *
 * Single-capability application use-case:
 * - Issue a new session token via SessionTokenService
 * - Persist it via SessionStoreContract
 */
export class EstablishSessionCommand {
  private readonly logger: LoggingClientContract;
  private readonly sessionCookieAdapter: SessionStoreContract;
  private readonly sessionTokenAdapter: SessionTokenAdapter;

  constructor(deps: SessionUseCaseDependencies) {
    this.logger = deps.logger.child({
      scope: "use-case",
      useCase: "establishSession",
    });
    this.sessionCookieAdapter = deps.sessionCookieAdapter;
    this.sessionTokenAdapter = deps.sessionTokenAdapter;
  }

  async execute(
    user: SessionPrincipalDto,
  ): Promise<Result<SessionPrincipalDto, AppError>> {
    try {
      const now = Date.now();

      const issuedResult = await this.sessionTokenAdapter.issue({
        role: user.role,
        sessionStart: now,
        userId: user.id,
      });

      if (!issuedResult.ok) {
        return Err(issuedResult.error);
      }

      const { expiresAtMs, token } = issuedResult.value;

      await this.sessionCookieAdapter.set(token, expiresAtMs);

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
