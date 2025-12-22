import "server-only";

import type {
  SessionPort,
  SessionTokenCodecPort,
} from "@/modules/auth/server/application/ports/session.port";
import type { SessionPrincipal } from "@/modules/auth/server/application/types/session-principal.types";
import { SESSION_DURATION_MS } from "@/modules/auth/server/contracts/session.policy.constants";
import type { AppError } from "@/shared/errors/core/app-error";
import { normalizeUnknownToAppError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

const ONE_SECOND_MS = 1000 as const;

export type EstablishSessionDeps = Readonly<{
  cookie: SessionPort;
  jwt: SessionTokenCodecPort;
  logger: LoggingClientContract;
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
  private readonly logger: LoggingClientContract;

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
        this.logger.error("Session establish failed: token encode failed", {
          error: encodedResult.error.message,
          logging: { code: "session_establish_encode_failed" },
        });
        return Err(encodedResult.error);
      }

      await this.cookie.set(encodedResult.value, expiresAtMs);

      this.logger.info("Session established", {
        logging: { expiresAt: expiresAtMs, role: user.role, userId: user.id },
      });

      return Ok(user);
    } catch (err: unknown) {
      const error = normalizeUnknownToAppError(err, "unexpected");

      this.logger.error("Session establish failed", {
        error: String(err),
        logging: { code: "session_establish_failed" },
      });

      return Err(error);
    }
  }
}
