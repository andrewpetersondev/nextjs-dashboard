import "server-only";

import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import { cleanupInvalidToken } from "@/modules/auth/application/use-cases/commands/rotate-session.command";
import { userIdCodec } from "@/modules/auth/domain/schemas/session.schemas";
import type { SessionTokenService } from "@/modules/auth/infrastructure/cryptography/session-token.service";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { normalizeUnknownToAppError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

export type GetSessionDeps = Readonly<{
  logger: LoggingClientContract;
  store: SessionStoreContract;
  tokenService: SessionTokenService;
}>;

/**
 * ReadSessionUseCase
 *
 * Single-capability verb:
 * - Read cookie from store
 * - Decode token via SessionTokenService
 * - Return principal info (or undefined if no valid session)
 */
export class GetSessionQuery {
  private readonly logger: LoggingClientContract;
  private readonly store: SessionStoreContract;
  private readonly tokenService: SessionTokenService;

  constructor(deps: GetSessionDeps) {
    this.logger = deps.logger.child({
      scope: "use-case",
      useCase: "readSession",
    });
    this.store = deps.store;
    this.tokenService = deps.tokenService;
  }

  async execute(): Promise<Result<SessionPrincipalDto | undefined, AppError>> {
    try {
      const token = await this.store.get();

      if (!token) {
        return Ok(undefined);
      }

      const decodedResult = await this.tokenService.decode(token);

      if (!decodedResult.ok) {
        await cleanupInvalidToken(this.store);

        if (decodedResult.error.key === "unexpected") {
          return Err(decodedResult.error);
        }

        return Ok(undefined);
      }

      const decoded = decodedResult.value;

      if (!decoded.userId) {
        await cleanupInvalidToken(this.store);
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
