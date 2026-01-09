import "server-only";

import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import { makeAuthUseCaseLogger } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { readSessionToken } from "@/modules/auth/application/helpers/read-session-token.helper";
import {
  makeInvalidSessionClaimsError,
  makeMissingSessionError,
} from "@/modules/auth/domain/policies/auth-security.policy";
import { userIdCodec } from "@/modules/auth/domain/schemas/auth-session.schema";
import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";
import type { SessionTransport } from "@/modules/auth/infrastructure/serialization/session.transport";
import type { AppError } from "@/shared/errors/core/app-error.entity";
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
  private readonly sessionTokenAdapter: SessionTokenServiceContract;

  constructor(deps: SessionUseCaseDependencies) {
    this.logger = makeAuthUseCaseLogger(deps.logger, "verifySession");
    this.sessionCookieAdapter = deps.sessionCookieAdapter;
    this.sessionTokenAdapter = deps.sessionTokenAdapter;
  }

  async execute(): Promise<Result<SessionTransport, AppError>> {
    const readResult = await readSessionToken(
      {
        sessionCookieAdapter: this.sessionCookieAdapter,
        sessionTokenAdapter: this.sessionTokenAdapter,
      },
      { cleanupOnInvalidToken: false },
    );

    if (!readResult.ok) {
      this.logger.operation("warn", "Session token decode failed", {
        operationContext: "session",
        operationIdentifiers: { reason: "decode_failed" },
        operationName: "session.verify.decode_failed",
      });
      return Err(readResult.error);
    }

    const outcome = readResult.value;

    if (outcome.kind === "missing_token") {
      this.logger.operation("debug", "No session token found", {
        operationContext: "session",
        operationIdentifiers: { reason: "no_token" },
        operationName: "session.verify.no_token",
      });
      return Err(makeMissingSessionError());
    }

    if (outcome.kind === "invalid_token") {
      this.logger.operation("warn", "Session token decode failed", {
        operationContext: "session",
        operationIdentifiers: { reason: "decode_failed" },
        operationName: "session.verify.decode_failed",
      });
      return Err(makeMissingSessionError()); // Consistent with "no valid session"
    }

    const decoded = outcome.decoded;

    if (!decoded.userId) {
      this.logger.operation("warn", "Session missing userId", {
        operationContext: "session",
        operationIdentifiers: { reason: "invalid_claims" },
        operationName: "session.verify.invalid_claims",
      });
      return Err(makeInvalidSessionClaimsError("Missing userId in claims"));
    }

    return Ok({
      isAuthorized: true,
      role: decoded.role,
      userId: userIdCodec.decode(decoded.userId),
    });
  }
}
