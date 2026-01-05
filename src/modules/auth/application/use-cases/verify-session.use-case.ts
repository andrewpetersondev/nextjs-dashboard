import "server-only";

import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import { userIdCodec } from "@/modules/auth/domain/schemas/auth-session.schema";
import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";
import type { SessionTokenAdapter } from "@/modules/auth/infrastructure/adapters/session-token.adapter";
import type { SessionTransport } from "@/modules/auth/infrastructure/serialization/session.transport";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * VerifySessionUseCase
 *
 * Single-capability query:
 * - Reads token from sessionCookieAdapter
 * - Decodes and validates claims
 * - Returns session transport or failure reason
 *
 * No side effects on failure (does not delete invalid tokens).
 */
export class VerifySessionUseCase {
  private readonly logger: LoggingClientContract;
  private readonly sessionCookieAdapter: SessionStoreContract;
  private readonly sessionTokenAdapter: SessionTokenAdapter;

  constructor(deps: SessionUseCaseDependencies) {
    this.logger = deps.logger.child({
      scope: "use-case",
      useCase: "verifySession",
    });
    this.sessionCookieAdapter = deps.sessionCookieAdapter;
    this.sessionTokenAdapter = deps.sessionTokenAdapter;
  }

  async execute(): Promise<Result<SessionTransport, AppError>> {
    const token = await this.sessionCookieAdapter.get();

    if (!token) {
      this.logger.operation("debug", "No session token found", {
        operationContext: "session",
        operationIdentifiers: { reason: "no_token" },
        operationName: "session.verify.no_token",
      });
      return Err(
        makeAppError(APP_ERROR_KEYS.unauthorized, {
          cause: "xxxxxx",
          message: "session.verify.no_token",
          metadata: {},
        }),
      );
    }

    const decodedResult = await this.sessionTokenAdapter.decode(token);

    if (!decodedResult.ok) {
      this.logger.operation("warn", "Session token decode failed", {
        operationContext: "session",
        operationIdentifiers: { reason: "decode_failed" },
        operationName: "session.verify.decode_failed",
      });
      return Err(decodedResult.error);
    }

    const decoded = decodedResult.value;

    if (!decoded.userId) {
      this.logger.operation("warn", "Session missing userId", {
        operationContext: "session",
        operationIdentifiers: { reason: "invalid_claims" },
        operationName: "session.verify.invalid_claims",
      });
      return Err(
        makeAppError(APP_ERROR_KEYS.validation, {
          cause: "xxxxxx",
          message: "session.verify.invalid_claims",
          metadata: {},
        }),
      );
    }

    return Ok({
      isAuthorized: true,
      role: decoded.role,
      userId: userIdCodec.decode(decoded.userId),
    });
  }
}
