import "server-only";

import type {
  SessionPort,
  SessionTokenCodecPort,
} from "@/modules/auth/server/application/ports/session.port";
import { userIdCodec } from "@/modules/auth/shared/domain/session/session.schemas";
import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";
import type { UserId } from "@/shared/branding/brands";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

export type ReadSessionDeps = Readonly<{
  cookie: SessionPort;
  jwt: SessionTokenCodecPort;
  logger: LoggingClientContract;
}>;

/**
 * ReadSessionUseCase
 *
 * Single-capability verb:
 * - read cookie
 * - decode token
 * - return principal info (or undefined if no valid session)
 *
 * Note: this use-case returns `undefined` for expected "no session" outcomes.
 * Operational failures are logged and also return `undefined` (current behavior parity).
 */
export class ReadSessionUseCase {
  private readonly cookie: SessionPort;
  private readonly jwt: SessionTokenCodecPort;
  private readonly logger: LoggingClientContract;

  constructor(deps: ReadSessionDeps) {
    this.cookie = deps.cookie;
    this.jwt = deps.jwt;
    this.logger = deps.logger.child({
      scope: "use-case",
      useCase: "readSession",
    });
  }

  async execute(): Promise<{ role: UserRole; userId: UserId } | undefined> {
    try {
      const token = await this.cookie.get();

      if (!token) {
        this.logger.warn("No session cookie present", {
          logging: { reason: "no_cookie" },
        });
        return;
      }

      const decodedResult = await this.jwt.decode(token);

      if (!decodedResult.ok) {
        this.logger.warn("Session decode failed", {
          logging: { reason: "decode_error" },
        });
        return;
      }

      const decoded = decodedResult.value;

      if (!decoded.userId) {
        this.logger.warn("Invalid session payload", {
          logging: { reason: "invalid_payload" },
        });
        return;
      }

      return { role: decoded.role, userId: userIdCodec.decode(decoded.userId) };
    } catch (err: unknown) {
      this.logger.error("Session read failed", {
        error: String(err),
        logging: { code: "session_read_failed" },
      });

      return;
    }
  }
}
