import type { ReadSessionOutcomeDto } from "@/modules/auth/application/dtos/read-session-outcome.dto";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type { SessionVerificationDto } from "@/modules/auth/application/dtos/session-verification.dto";
import type { UpdateSessionOutcomeDto } from "@/modules/auth/application/dtos/update-session-outcome.dto";
import type { TerminateSessionReason } from "@/modules/auth/domain/policies/session-lifecycle.policy";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Contract defining session operations available to the application layer.
 * This abstraction allows workflows to remain independent of the specific
 * infrastructure implementation (JWT, Cookies, etc.).
 *
 * "Application-level contract composed from use-cases; not for direct infrastructure implementation"
 */
export interface SessionServiceContract {
  establish(
    user: SessionPrincipalDto,
  ): Promise<Result<SessionPrincipalDto, AppError>>;
  /**
   * Reads the current session and returns full session state including lifecycle info.
   * Returns undefined if no valid session is found.
   */
  read(): Promise<Result<ReadSessionOutcomeDto | undefined, AppError>>;
  rotate(): Promise<Result<UpdateSessionOutcomeDto, AppError>>;
  terminate(reason: TerminateSessionReason): Promise<Result<void, AppError>>;
  verify(): Promise<Result<SessionVerificationDto, AppError>>;
}
