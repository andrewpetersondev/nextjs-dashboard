import "server-only";

import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import type { SessionIdentityDto } from "@/modules/auth/application/dtos/session-identity.dto";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { readSessionTokenHelper } from "@/modules/auth/application/helpers/read-session-token.helper";
import { cleanupInvalidTokenHelper } from "@/modules/auth/application/helpers/session-cleanup.helper";
import { toSessionPrincipalPolicy } from "@/modules/auth/application/mappers/to-session-principal-policy.mapper";
import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import { safeExecute } from "@/shared/results/safe-execute";

/**
 * ReadSessionUseCase
 *
 * Single-capability verb:
 * - Read cookie from store
 * - Decode token via SessionTokenService
 * - Return principal info (or undefined if no valid session)
 */
export class ReadSessionUseCase {
  private readonly logger: LoggingClientContract;
  private readonly sessionStore: SessionStoreContract;
  private readonly sessionTokenService: SessionTokenServiceContract;

  constructor(deps: SessionUseCaseDependencies) {
    this.logger = makeAuthUseCaseLoggerHelper(deps.logger, "readSession");
    this.sessionStore = deps.sessionStore;
    this.sessionTokenService = deps.sessionTokenService;
  }

  execute(): Promise<Result<SessionIdentityDto | undefined, AppError>> {
    return safeExecute(
      async () => {
        const readResult = await readSessionTokenHelper(
          {
            sessionStore: this.sessionStore,
            sessionTokenService: this.sessionTokenService,
          },
          { cleanupOnInvalidToken: true },
        );

        if (!readResult.ok) {
          return readResult;
        }

        const outcome = readResult.value;

        if (outcome.kind !== "decoded") {
          return Ok(undefined);
        }

        const decoded = outcome.decoded;

        // Ensure we have a valid identity before converting to principal
        if (!decoded.userId) {
          await cleanupInvalidTokenHelper(this.sessionStore);
          this.logger.operation("warn", "Session missing userId", {
            operationContext: "session",
            operationIdentifiers: { reason: "invalid_claims" },
            operationName: "session.read.invalid_claims",
          });
          return Ok(undefined);
        }

        return Ok(toSessionPrincipalPolicy(decoded));
      },
      {
        logger: this.logger,
        message: "An unexpected error occurred while reading the session.",
        operation: "getSession",
      },
    );
  }
}
