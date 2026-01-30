import type { SessionServiceContract } from "@/modules/auth/application/contracts/session-service.contract";
import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import type { ReadSessionOutcomeDto } from "@/modules/auth/application/dtos/read-session-outcome.dto";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type { SessionVerificationDto } from "@/modules/auth/application/dtos/session-verification.dto";
import type { UpdateSessionOutcomeDto } from "@/modules/auth/application/dtos/update-session-outcome.dto";
import { EstablishSessionUseCase } from "@/modules/auth/application/session/establish-session.use-case";
import { ReadSessionUseCase } from "@/modules/auth/application/session/read-session.use-case";
import { RequireSessionUseCase } from "@/modules/auth/application/session/require-session.use-case";
import { RotateSessionUseCase } from "@/modules/auth/application/session/rotate-session.use-case";
import { TerminateSessionUseCase } from "@/modules/auth/application/session/terminate-session.use-case";
import type { TerminateSessionReason } from "@/modules/auth/domain/policies/session/evaluate-session-lifecycle.policy";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Concrete implementation of the SessionServiceContract.
 *
 * This service acts as a facade over various session-related use cases,
 * delegating execution to specialized use case classes.
 *
 * @implements {SessionServiceContract}
 */
export class SessionService implements SessionServiceContract {
  private readonly deps: SessionUseCaseDependencies;

  /**
   * Initializes the session service.
   *
   * @param deps - The dependencies required by session use cases.
   */
  constructor(deps: SessionUseCaseDependencies) {
    this.deps = deps;
  }

  /**
   * Establishes a new session for a user.
   *
   * @param user - The user principal for whom to establish the session.
   * @returns A promise resolving to a {@link Result} containing the user principal.
   */
  establish(
    user: SessionPrincipalDto,
  ): Promise<Result<SessionPrincipalDto, AppError>> {
    return new EstablishSessionUseCase(this.deps).execute(user);
  }

  /**
   * Reads the current session.
   *
   * @returns A promise resolving to a {@link Result} containing the session outcome or undefined if no session.
   */
  read(): Promise<Result<ReadSessionOutcomeDto | undefined, AppError>> {
    return new ReadSessionUseCase(this.deps).execute();
  }

  /**
   * Rotates the current session.
   *
   * @returns A promise resolving to a {@link Result} containing the updated session outcome.
   */
  rotate(): Promise<Result<UpdateSessionOutcomeDto, AppError>> {
    return new RotateSessionUseCase(this.deps).execute();
  }

  /**
   * Terminates the current session.
   *
   * @param reason - The reason for terminating the session.
   * @returns A promise resolving to a {@link Result} indicating success.
   */
  terminate(reason: TerminateSessionReason): Promise<Result<void, AppError>> {
    return new TerminateSessionUseCase(this.deps).execute(reason);
  }

  /**
   * Verifies the current session.
   *
   * @returns A promise resolving to a {@link Result} containing the session verification data.
   */
  async verify(): Promise<Result<SessionVerificationDto, AppError>> {
    const requireSessionUseCase: RequireSessionUseCase =
      new RequireSessionUseCase(new ReadSessionUseCase(this.deps));

    const sessionResult = await requireSessionUseCase.execute();
    if (!sessionResult.ok) {
      return Err(sessionResult.error);
    }
    return Ok({
      isAuthorized: true,
      role: sessionResult.value.role,
      userId: String(sessionResult.value.id),
    });
  }
}
