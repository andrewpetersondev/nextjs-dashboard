import "server-only";

import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import { cleanupInvalidToken } from "@/modules/auth/application/use-cases/rotate-session.command";
import { userIdCodec } from "@/modules/auth/domain/schemas/session.schemas";
import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";
import type { SessionTokenAdapter } from "@/modules/auth/infrastructure/adapters/session-token.adapter";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { normalizeUnknownToAppError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * ReadSessionUseCase
 *
 * Single-capability verb:
 * - Read cookie from store
 * - Decode token via SessionTokenService
 * - Return principal info (or undefined if no valid session)
 */
export class GetSessionUseCase {
  private readonly logger: LoggingClientContract;
  private readonly sessionCookieAdapter: SessionStoreContract;
  private readonly sessionTokenAdapter: SessionTokenAdapter;

  constructor(deps: SessionUseCaseDependencies) {
    this.logger = deps.logger.child({
      scope: "use-case",
      useCase: "readSession",
    });
    this.sessionCookieAdapter = deps.sessionCookieAdapter;
    this.sessionTokenAdapter = deps.sessionTokenAdapter;
  }

  async execute(): Promise<Result<SessionPrincipalDto | undefined, AppError>> {
    try {
      const token = await this.sessionCookieAdapter.get();

      if (!token) {
        return Ok(undefined);
      }

      const decodedResult = await this.sessionTokenAdapter.decode(token);

      if (!decodedResult.ok) {
        await cleanupInvalidToken(this.sessionCookieAdapter);

        if (decodedResult.error.key === "unexpected") {
          return Err(decodedResult.error);
        }

        return Ok(undefined);
      }

      const decoded = decodedResult.value;

      if (!decoded.userId) {
        await cleanupInvalidToken(this.sessionCookieAdapter);
        return Ok(undefined);
      }

      return Ok({
        id: userIdCodec.decode(decoded.userId),
        role: decoded.role,
      });
    } catch (err: unknown) {
      return Err(normalizeUnknownToAppError(err, "unexpected"));
    }
  }
}
