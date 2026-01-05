import "server-only";

import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type { TerminateSessionReason } from "@/modules/auth/application/use-cases/terminate-session.command";
import type { UpdateSessionOutcome } from "@/modules/auth/domain/policies/session.policy";
import type { SessionTransport } from "@/modules/auth/infrastructure/serialization/session.transport";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Contract defining session operations available to the application layer.
 * This abstraction allows workflows to remain independent of the specific
 * infrastructure implementation (JWT, Cookies, etc.).
 */
export interface SessionAdapterContract {
  establish(
    user: SessionPrincipalDto,
  ): Promise<Result<SessionPrincipalDto, AppError>>;
  read(): Promise<Result<SessionPrincipalDto | undefined, AppError>>;
  rotate(): Promise<Result<UpdateSessionOutcome, AppError>>;
  terminate(reason: TerminateSessionReason): Promise<Result<void, AppError>>;
  verify(): Promise<Result<SessionTransport, AppError>>;
}
