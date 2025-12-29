import "server-only";

import { issueSessionToken } from "@/modules/auth/server/application/services/session-token-factory.service";
import type { SessionStoreContract } from "@/modules/auth/server/application/types/contracts/session-store.contract";
import type { SessionTokenCodecContract } from "@/modules/auth/server/application/types/contracts/session-token-codec.contract";
import type { SessionPrincipalDto } from "@/modules/auth/server/application/types/dtos/session-principal.dto";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { normalizeUnknownToAppError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

export type EstablishSessionDeps = Readonly<{
  cookie: SessionStoreContract;
  jwt: SessionTokenCodecContract;
  logger: LoggingClientPort;
}>;

/**
 * EstablishSessionUseCase
 *
 * Single-capability application use-case:
 * - issue a new session token (JWT encode via port)
 * - persist it (cookie set via port)
 */
export class EstablishSessionUseCase {
  private readonly cookie: SessionStoreContract;
  private readonly jwt: SessionTokenCodecContract;
  private readonly logger: LoggingClientPort;

  constructor(deps: EstablishSessionDeps) {
    this.cookie = deps.cookie;
    this.jwt = deps.jwt;
    this.logger = deps.logger.child({
      scope: "use-case",
      useCase: "establishSession",
    });
  }

  async execute(
    user: SessionPrincipalDto,
  ): Promise<Result<SessionPrincipalDto, AppError>> {
    try {
      const now = Date.now();

      const issuedResult = await issueSessionToken(this.jwt, {
        role: user.role,
        sessionStart: now,
        userId: user.id,
      });

      if (!issuedResult.ok) {
        return Err(issuedResult.error);
      }

      const { expiresAtMs, token } = issuedResult.value;

      await this.cookie.set(token, expiresAtMs);

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
