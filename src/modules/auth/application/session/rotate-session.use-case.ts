import "server-only";
import {
  buildUpdateSessionNotRotated,
  buildUpdateSessionSuccess,
} from "@/modules/auth/application/builders/update-session-outcome.builder";
import { AUTH_USE_CASE_NAMES } from "@/modules/auth/application/constants/auth-logging.constants";
import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import {
  UPDATE_SESSION_OUTCOME_REASON,
  type UpdateSessionNotRotatedDto,
  type UpdateSessionOutcomeDto,
} from "@/modules/auth/application/dtos/update-session-outcome.dto";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { readSessionTokenHelper } from "@/modules/auth/application/helpers/read-session-token.helper";
import { setSessionCookieAndLogHelper } from "@/modules/auth/application/helpers/session-cookie-ops.helper";
import { toSessionEntity } from "@/modules/auth/application/mappers/to-session-entity.mapper";
import { UserIdSchema } from "@/modules/auth/application/schemas/session-token-claims.schema";
import {
  evaluateSessionLifecyclePolicy,
  requiresRotation,
  requiresTermination,
} from "@/modules/auth/domain/policies/session/evaluate-session-lifecycle.policy";
import { toUnixSeconds } from "@/modules/auth/domain/values/time.value";
import { nowInSeconds } from "@/shared/constants/time.constants";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import { safeExecute } from "@/shared/results/safe-execute";

/**
 * Performs rotation of a valid session.
 *
 * This use case handles the actual process of issuing a new rotated token
 * (reusing the session ID but getting a new JWT ID) and updating the session store.
 * It assumes the session has already been validated.
 */
export class RotateSessionUseCase {
  private readonly logger: LoggingClientContract;
  private readonly sessionStore: SessionStoreContract;
  private readonly sessionTokenService: SessionTokenServiceContract;

  /**
   * @param deps - Dependencies required for session rotation.
   */
  constructor(deps: SessionUseCaseDependencies) {
    this.logger = makeAuthUseCaseLoggerHelper(
      deps.logger,
      AUTH_USE_CASE_NAMES.ROTATE_SESSION,
    );
    this.sessionStore = deps.sessionStore;
    this.sessionTokenService = deps.sessionTokenService;
  }

  /**
   * Executes the session rotation logic.
   *
   * @returns A Result containing the update session outcome DTO.
   *
   * @throws {Error} If an unexpected system failure occurs (wrapped in Result).
   */
  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: rotation flow is intentionally verbose (many early returns for clarity)
  execute(): Promise<Result<UpdateSessionOutcomeDto, AppError>> {
    return safeExecute<UpdateSessionOutcomeDto>(
      // biome-ignore lint/complexity/noExcessiveLinesPerFunction: rotation flow is intentionally verbose (many early returns for clarity)
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: rotation flow is intentionally verbose (many early returns for clarity)
      async () => {
        const nowSec = toUnixSeconds(nowInSeconds());

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

        if (outcome.kind !== "decoded" || !outcome.decoded.sub) {
          return Ok(
            buildUpdateSessionNotRotated({
              reason: UPDATE_SESSION_OUTCOME_REASON.invalidOrMissingUser,
            }),
          );
        }

        const sessionEntity = toSessionEntity(outcome.decoded);
        const decision = evaluateSessionLifecyclePolicy(sessionEntity, nowSec);

        if (requiresTermination(decision)) {
          const failureReason: UpdateSessionNotRotatedDto["reason"] =
            decision.reason === "absolute_limit_exceeded"
              ? UPDATE_SESSION_OUTCOME_REASON.absoluteLifetimeExceeded
              : UPDATE_SESSION_OUTCOME_REASON.expired;

          return Ok(
            buildUpdateSessionNotRotated({
              ageSec: decision.ageSec,
              maxSec: decision.maxSec,
              reason: failureReason,
            }),
          );
        }

        if (!requiresRotation(decision)) {
          return Ok(
            buildUpdateSessionNotRotated({
              reason: UPDATE_SESSION_OUTCOME_REASON.notNeeded,
              timeLeftSec: decision.timeLeftSec,
            }),
          );
        }

        const { role, sid, sub } = outcome.decoded;

        if (!sid) {
          return Ok(
            buildUpdateSessionNotRotated({
              reason: UPDATE_SESSION_OUTCOME_REASON.invalidOrMissingUser,
            }),
          );
        }

        const decodedUserId = UserIdSchema.decode(sub);

        const issuedResult = await this.sessionTokenService.issueRotated({
          role,
          sid,
          userId: decodedUserId,
        });

        if (!issuedResult.ok) {
          return Err(issuedResult.error);
        }

        const { expiresAtMs, token } = issuedResult.value;

        await setSessionCookieAndLogHelper(
          {
            logger: this.logger,
            sessionCookieAdapter: this.sessionStore,
          },
          {
            expiresAtMs,
            identifiers: {
              reason: UPDATE_SESSION_OUTCOME_REASON.rotated,
              role,
              userId: decodedUserId,
            },
            message: "Session rotated successfully",
            operationName: "session.rotate.success",
            token,
          },
        );

        return Ok(
          buildUpdateSessionSuccess({
            expiresAtMs,
            role,
            userId: decodedUserId,
          }),
        );
      },
      {
        logger: this.logger,
        message: "An unexpected error occurred while rotating the session.",
        operation: AUTH_USE_CASE_NAMES.ROTATE_SESSION,
      },
    );
  }
}
