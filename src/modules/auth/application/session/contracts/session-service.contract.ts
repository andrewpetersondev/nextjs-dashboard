import type { ReadSessionOutcomeDto } from "@/modules/auth/application/session/dtos/responses/read-session-outcome.dto";
import type { SessionPrincipalDto } from "@/modules/auth/application/session/dtos/responses/session-principal.dto";
import type { SessionVerificationDto } from "@/modules/auth/application/session/dtos/responses/session-verification.dto";
import type { UpdateSessionOutcomeDto } from "@/modules/auth/application/session/dtos/responses/update-session-outcome.dto";
import type { TerminateSessionReason } from "@/modules/auth/domain/session/policies/lifecycle/evaluate-session-lifecycle.policy";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { Result } from "@/shared/core/results/result.types";

/**
 * Contract defining session operations available to the application layer.
 * This abstraction allows workflows to remain independent of the specific
 * infrastructure implementation (JWT, Cookies, etc.).
 *
 * Recommended usage:
 * - Use `read()` when session is optional (anonymous allowed).
 * - Use `verify()` when session is required (unauthorized is an error).
 *
 * Avoid constructing session use cases directly in actions/workflows.
 */
export interface SessionServiceContract {
  /**
   * Establishes a new session for the given user principal.
   *
   * @param user - The user principal for whom the session is established.
   * @returns A Result containing the session principal or an AppError.
   */
  establish(
    user: SessionPrincipalDto,
  ): Promise<Result<SessionPrincipalDto, AppError>>;

  /**
   * Reads the current session and returns the full session state including lifecycle info.
   *
   * @returns A Result containing the session outcome or undefined if no valid session is found.
   */
  read(): Promise<Result<ReadSessionOutcomeDto | undefined, AppError>>;

  /**
   * Rotates the current session token to extend its lifetime or enhance security.
   *
   * @returns A Result containing the updated session outcome.
   */
  rotate(): Promise<Result<UpdateSessionOutcomeDto, AppError>>;

  /**
   * Terminates the current session.
   *
   * @param reason - The reason for terminating the session (e.g., logout, expired).
   * @returns A Result indicating success or an AppError.
   */
  terminate(reason: TerminateSessionReason): Promise<Result<void, AppError>>;

  /**
   * Verifies the validity of the current session.
   *
   * @returns A Result containing the session verification status.
   */
  verify(): Promise<Result<SessionVerificationDto, AppError>>;
}
