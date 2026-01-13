import "server-only";

import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import type { SessionVerificationDto } from "@/modules/auth/application/dtos/session-verification.dto";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { readSessionTokenHelper } from "@/modules/auth/application/helpers/read-session-token.helper";
import { toSessionEntity } from "@/modules/auth/application/mappers/to-session-entity.mapper";
import { AuthSecurityErrors } from "@/modules/auth/domain/policies/auth-security.policy";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * VerifySessionUseCase
 *
 * Single-capability query:
 * - Reads token from sessionStore
 * - Decodes and validates claims
 * - Returns session transport or failure reason
 *
 * No side effects on failure (does not delete invalid tokens).
 */
export class VerifySessionUseCase {
  private readonly logger: LoggingClientContract;
  private readonly sessionStore: SessionStoreContract;
  private readonly sessionTokenService: SessionTokenServiceContract;

  constructor(deps: SessionUseCaseDependencies) {
    this.logger = makeAuthUseCaseLoggerHelper(deps.logger, "verifySession");
    this.sessionStore = deps.sessionStore;
    this.sessionTokenService = deps.sessionTokenService;
  }

  async execute(): Promise<Result<SessionVerificationDto, AppError>> {
    const readResult = await readSessionTokenHelper(
      {
        sessionStore: this.sessionStore,
        sessionTokenService: this.sessionTokenService,
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
      return Err(AuthSecurityErrors.missingSession());
    }

    if (outcome.kind === "invalid_token") {
      this.logger.operation("warn", "Session token invalid", {
        operationContext: "session",
        operationIdentifiers: { reason: "invalid_token" },
        operationName: "session.verify.invalid_token",
      });
      return Err(AuthSecurityErrors.missingSession());
    }

    const decoded = outcome.decoded;

    if (!decoded.sub) {
      this.logger.operation("warn", "Session missing subject (sub)", {
        operationContext: "session",
        operationIdentifiers: { reason: "invalid_claims" },
        operationName: "session.verify.invalid_claims",
      });
      return Err(AuthSecurityErrors.invalidClaims("Missing sub in claims"));
    }

    const sessionEntity = toSessionEntity(decoded);

    // TODO: can i move this to a policy? should it be a builder? should it be a mapper?
    return Ok({
      isAuthorized: true,
      role: sessionEntity.role,
      userId: String(sessionEntity.userId),
    });
  }
}
