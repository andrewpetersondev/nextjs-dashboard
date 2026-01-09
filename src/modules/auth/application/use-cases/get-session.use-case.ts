import "server-only";

import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import { makeAuthUseCaseLogger } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { readSessionToken } from "@/modules/auth/application/helpers/read-session-token.helper";
import { cleanupInvalidToken } from "@/modules/auth/application/helpers/session-cleanup.helper";
import { toSessionPrincipal } from "@/modules/auth/domain/policies/session.policy";
import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";
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
  private readonly sessionTokenAdapter: SessionTokenServiceContract;

  constructor(deps: SessionUseCaseDependencies) {
    this.logger = makeAuthUseCaseLogger(deps.logger, "getSession");
    this.sessionCookieAdapter = deps.sessionCookieAdapter;
    this.sessionTokenAdapter = deps.sessionTokenAdapter;
  }

  async execute(): Promise<Result<SessionPrincipalDto | undefined, AppError>> {
    try {
      const readResult = await readSessionToken(
        {
          sessionCookieAdapter: this.sessionCookieAdapter,
          sessionTokenAdapter: this.sessionTokenAdapter,
        },
        { cleanupOnInvalidToken: true },
      );

      if (!readResult.ok) {
        return Err(readResult.error);
      }

      const outcome = readResult.value;

      if (outcome.kind !== "decoded") {
        return Ok(undefined);
      }

      const decoded = outcome.decoded;

      // Ensure we have a valid identity before converting to principal
      if (!decoded.userId) {
        await cleanupInvalidToken(this.sessionCookieAdapter);
        this.logger.operation("warn", "Session missing userId", {
          operationContext: "session",
          operationIdentifiers: { reason: "invalid_claims" },
          operationName: "session.read.invalid_claims",
        });
        return Ok(undefined);
      }

      return Ok(toSessionPrincipal(decoded));
    } catch (err: unknown) {
      return Err(normalizeUnknownToAppError(err, "unexpected"));
    }
  }
}
