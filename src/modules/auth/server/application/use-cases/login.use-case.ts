import "server-only";

import type { AuthUserService } from "@/modules/auth/server/application/services/auth-user.service";
import type { SessionService } from "@/modules/auth/server/application/services/session.service";
import type { SessionPrincipal } from "@/modules/auth/server/application/types/session-principal.types";
import type { LoginData } from "@/modules/auth/shared/domain/user/auth.schema";
import type { AppError } from "@/shared/errors/core/app-error.class";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Orchestrates user login: authenticate user and establish a session.
 *
 * @remarks
 * - Uses Result-first handling for expected failures.
 * - No framework concerns; suitable for Server Actions, API routes, or tests.
 */
export class LoginUseCase {
  private readonly authUserService: AuthUserService;
  private readonly sessionService: SessionService;

  constructor(
    authUserService: AuthUserService,
    sessionService: SessionService,
  ) {
    this.authUserService = authUserService;
    this.sessionService = sessionService;
  }

  /**
   * Validates credentials via `AuthUserService` and establishes a session via `SessionService`.
   *
   * @param input - LoginData containing email and password.
   * @returns Result with SessionPrincipal on success or AppError on failure.
   */
  async execute(
    input: Readonly<LoginData>,
  ): Promise<Result<SessionPrincipal, AppError>> {
    const authResult = await this.authUserService.login(input);

    if (!authResult.ok) {
      return Err<AppError>(authResult.error);
    }

    const user = authResult.value;

    const sessionResult = await this.sessionService.establish({
      id: user.id,
      role: user.role,
    });

    if (!sessionResult.ok) {
      return Err<AppError>(sessionResult.error);
    }

    return Ok<SessionPrincipal>(sessionResult.value);
  }
}
