import "server-only";

import type { SessionPort } from "@/modules/auth/server/application/ports/session.port";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { normalizeUnknownToAppError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

export type ClearSessionDeps = Readonly<{
  cookie: SessionPort;
  logger: LoggingClientPort;
}>;

/**
 * ClearSessionUseCase
 *
 * Single-capability verb:
 * - delete the session cookie
 */
export class ClearSessionUseCase {
  private readonly cookie: SessionPort;
  private readonly logger: LoggingClientPort;

  constructor(deps: ClearSessionDeps) {
    this.cookie = deps.cookie;
    this.logger = deps.logger.child({
      scope: "use-case",
      useCase: "clearSession",
    });
  }

  async execute(): Promise<Result<void, AppError>> {
    try {
      await this.cookie.delete();

      return Ok<void>(undefined);
    } catch (err: unknown) {
      return Err(normalizeUnknownToAppError(err, "unexpected"));
    }
  }
}
