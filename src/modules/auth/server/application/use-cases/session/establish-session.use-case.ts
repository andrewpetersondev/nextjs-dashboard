import "server-only";

import type {
  SessionPort,
  SessionTokenCodecPort,
} from "@/modules/auth/server/application/ports/session.port";
import type { SessionPrincipal } from "@/modules/auth/server/application/types/session-principal.types";
import { SESSION_DURATION_MS } from "@/modules/auth/server/contracts/session.policy.constants";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { normalizeUnknownToAppError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

const ONE_SECOND_MS = 1000 as const;

export type EstablishSessionDeps = Readonly<{
  cookie: SessionPort;
  jwt: SessionTokenCodecPort;
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
  private readonly cookie: SessionPort;
  private readonly jwt: SessionTokenCodecPort;
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
    user: SessionPrincipal,
  ): Promise<Result<SessionPrincipal, AppError>> {
    try {
      const now = Date.now();
      const expiresAtMs = now + SESSION_DURATION_MS;

      const claims = {
        exp: Math.floor(expiresAtMs / ONE_SECOND_MS),
        expiresAt: expiresAtMs,
        iat: Math.floor(now / ONE_SECOND_MS),
        role: user.role,
        sessionStart: now,
        userId: String(user.id),
      };

      const encodedResult = await this.jwt.encode(claims, expiresAtMs);

      if (!encodedResult.ok) {
        return Err(encodedResult.error);
      }

      await this.cookie.set(encodedResult.value, expiresAtMs);

      return Ok(user);
    } catch (err: unknown) {
      return Err(normalizeUnknownToAppError(err, "unexpected"));
    }
  }
}
