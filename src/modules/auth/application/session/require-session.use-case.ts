import "server-only";
import type { ReadSessionOutcomeDto } from "@/modules/auth/application/dtos/read-session-outcome.dto";
import type { ReadSessionUseCase } from "@/modules/auth/application/session/read-session.use-case";
import { AuthSecurityErrors } from "@/modules/auth/domain/policies/security/auth-security.policy";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

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
      return Err(AuthSecurityErrors.missingSession());
    }

    return Ok(session);
  }
}
