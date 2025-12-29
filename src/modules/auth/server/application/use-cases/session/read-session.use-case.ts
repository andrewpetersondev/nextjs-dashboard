import "server-only";

import type { SessionStoreContract } from "@/modules/auth/server/application/types/contracts/session-store.contract";
import type { SessionTokenCodecContract } from "@/modules/auth/server/application/types/contracts/session-token-codec.contract";
import type { SessionPrincipalDto } from "@/modules/auth/server/application/types/dtos/session-principal.dto";
import { userIdCodec } from "@/modules/auth/shared/domain/session/session.schemas";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { normalizeUnknownToAppError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

export type ReadSessionDeps = Readonly<{
  cookie: SessionStoreContract;
  jwt: SessionTokenCodecContract;
  logger: LoggingClientPort;
}>;

/**
 * ReadSessionUseCase
 *
 * Single-capability verb:
 * - read cookie
 * - decode token
 * - return principal info (or undefined if no valid session)
 *
 * Note: this use-case returns `undefined` for expected "no session" outcomes.
 * Operational failures are logged and also return `undefined` (current behavior parity).
 */
export class ReadSessionUseCase {
  private readonly cookie: SessionStoreContract;
  private readonly jwt: SessionTokenCodecContract;
  private readonly logger: LoggingClientPort;

  constructor(deps: ReadSessionDeps) {
    this.cookie = deps.cookie;
    this.jwt = deps.jwt;
    this.logger = deps.logger.child({
      scope: "use-case",
      useCase: "readSession",
    });
  }

  // Returns Result with principal or undefined. Undefined indicates "no valid session"; Err indicates operational failure.
  async execute(): Promise<Result<SessionPrincipalDto | undefined, AppError>> {
    try {
      const token = await this.cookie.get();

      if (!token) {
        return Ok(undefined);
      }

      const decodedResult = await this.jwt.decode(token);

      if (!decodedResult.ok) {
        // Here we can decide: is an invalid JWT an Error or just "no session"?
        // Usually, for security hygiene, we clear it and return undefined (no session),
        // but we might want to keep the Err if it's a structural failure (e.g. missing secret).
        try {
          await this.cookie.delete();
        } catch (_) {
          // ignore cleanup failure
        }

        // If the error is technical (like missing secret), propagate it.
        // If it's just an expired/invalid token, treat as "no session".
        if (decodedResult.error.key === "unexpected") {
          return Err(decodedResult.error);
        }

        return Ok(undefined);
      }

      const decoded = decodedResult.value;

      if (!decoded.userId) {
        // Cookie hygiene: remove unusable token
        try {
          await this.cookie.delete();
        } catch (_) {
          // ignore cleanup failure
        }
        return Ok(undefined);
      }

      const result = {
        id: userIdCodec.decode(decoded.userId),
        role: decoded.role,
      };
      return Ok(result);
    } catch (err: unknown) {
      return Err(normalizeUnknownToAppError(err, "unexpected"));
    }
  }
}
