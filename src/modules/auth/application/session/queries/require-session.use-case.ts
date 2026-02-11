import "server-only";
import type { ReadSessionOutcomeDto } from "@/modules/auth/application/session/dtos/responses/read-session-outcome.dto";
import type { ReadSessionUseCase } from "@/modules/auth/application/session/queries/read-session.use-case";
import { AuthSecurityFailures } from "@/modules/auth/domain/session/policies/security/auth-security.policy";
import { APP_ERROR_KEYS } from "@/shared/core/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { makeAppError } from "@/shared/core/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/results/result";
import type { Result } from "@/shared/core/results/result.types";

/**
 * Requires a valid session (as opposed to a "presence check").
 *
 * @remarks
 * This use case is typically composed by {@link SessionServiceContract} implementations.
 * Prefer calling `sessionService.verify()` from actions/workflows.
 *
 * Notes:
 * - `ReadSessionUseCase` returns `Ok(undefined)` when there is no valid session
 *   (missing/expired/invalid are treated as anonymous).
 * - This use case converts that "no session" state into an Unauthorized `AppError`.
 */
export class RequireSessionUseCase {
  private readonly readSessionUseCase: ReadSessionUseCase;

  constructor(readSessionUseCase: ReadSessionUseCase) {
    this.readSessionUseCase = readSessionUseCase;
  }

  async execute(): Promise<Result<ReadSessionOutcomeDto, AppError>> {
    const readResult: Result<ReadSessionOutcomeDto | undefined, AppError> =
      await this.readSessionUseCase.execute();

    if (!readResult.ok) {
      return readResult;
    }

    const session: ReadSessionOutcomeDto | undefined = readResult.value;

    if (!session) {
      const failure = AuthSecurityFailures.missingSession();

      return Err(
        makeAppError(APP_ERROR_KEYS.unauthorized, {
          cause: "No active session found.",
          message: "No active session found.",
          metadata: {
            policy: failure.policy,
            reason: failure.reason,
          },
        }),
      );
    }

    return Ok(session);
  }
}
