import "server-only";

import type { SessionPort } from "@/modules/auth/server/application/ports/session.port";
import type { AppError } from "@/shared/errors/core/app-error.class";
import { makeAppErrorFromUnknown } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

export type ClearSessionDeps = Readonly<{
  cookie: SessionPort;
  logger: LoggingClientContract;
}>;

/**
 * ClearSessionUseCase
 *
 * Single-capability verb:
 * - delete the session cookie
 */
export class ClearSessionUseCase {
  private readonly cookie: SessionPort;
  private readonly logger: LoggingClientContract;

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

      this.logger.info("Session cleared", {
        logging: { context: "ClearSessionUseCase.execute" },
      });

      return Ok<void>(undefined);
    } catch (err: unknown) {
      const error = makeAppErrorFromUnknown(err, "unexpected");

      this.logger.error("Session clear failed", {
        error: String(err),
        logging: { code: "session_clear_failed" },
      });

      return Err(error);
    }
  }
}
