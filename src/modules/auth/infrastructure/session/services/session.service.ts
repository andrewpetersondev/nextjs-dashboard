import type { SessionServiceContract } from "@/modules/auth/application/contracts/session-service.contract";
import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import type { ReadSessionOutcomeDto } from "@/modules/auth/application/dtos/read-session-outcome.dto";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type { SessionVerificationDto } from "@/modules/auth/application/dtos/session-verification.dto";
import type { UpdateSessionOutcomeDto } from "@/modules/auth/application/dtos/update-session-outcome.dto";
import { EstablishSessionUseCase } from "@/modules/auth/application/session/establish-session.use-case";
import { ReadSessionUseCase } from "@/modules/auth/application/session/read-session.use-case";
import { RotateSessionUseCase } from "@/modules/auth/application/session/rotate-session.use-case";
import { TerminateSessionUseCase } from "@/modules/auth/application/session/terminate-session.use-case";
import { VerifySessionUseCase } from "@/modules/auth/application/session/verify-session.use-case";
import type { TerminateSessionReason } from "@/modules/auth/domain/policies/session-lifecycle.policy";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

export class SessionService implements SessionServiceContract {
  private readonly deps: SessionUseCaseDependencies;

  constructor(deps: SessionUseCaseDependencies) {
    this.deps = deps;
  }

  establish(
    user: SessionPrincipalDto,
  ): Promise<Result<SessionPrincipalDto, AppError>> {
    return new EstablishSessionUseCase(this.deps).execute(user);
  }

  read(): Promise<Result<ReadSessionOutcomeDto | undefined, AppError>> {
    return new ReadSessionUseCase(this.deps).execute();
  }

  rotate(): Promise<Result<UpdateSessionOutcomeDto, AppError>> {
    return new RotateSessionUseCase(this.deps).execute();
  }

  terminate(reason: TerminateSessionReason): Promise<Result<void, AppError>> {
    return new TerminateSessionUseCase(this.deps).execute(reason);
  }

  verify(): Promise<Result<SessionVerificationDto, AppError>> {
    return new VerifySessionUseCase(this.deps).execute();
  }
}
