import "server-only";

import type { SessionStoreContract } from "@/modules/auth/server/application/types/contracts/session-store.contract";
import type { SessionTokenCodecContract } from "@/modules/auth/server/application/types/contracts/session-token-codec.contract";
import { userIdCodec } from "@/modules/auth/shared/domain/session/session.schemas";
import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";

export type ReadSessionDeps = Readonly<{
  cookie: SessionStoreContract;
  jwt: SessionTokenCodecContract;
  logger: LoggingClientPort;
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
  private readonly cookie: SessionStoreContract;
  private readonly jwt: SessionTokenCodecContract;
  private readonly logger: LoggingClientPort;

  constructor(deps: ReadSessionDeps) {
    this.cookie = deps.cookie;
    this.jwt = deps.jwt;
    this.logger = deps.logger.child({
      scope: "use-case",
      useCase: "readSession",
    });
  }

  // todo: why does this return type allow undefined? can i use type SessionPrincipal | undefined instead?
  async execute(): Promise<{ role: UserRole; userId: UserId } | undefined> {
    try {
      const token = await this.cookie.get();

      if (!token) {
        return;
      }

      const decodedResult = await this.jwt.decode(token);

      if (!decodedResult.ok) {
        return;
      }

      const decoded = decodedResult.value;

      if (!decoded.userId) {
        return;
      }

      return { role: decoded.role, userId: userIdCodec.decode(decoded.userId) };
    } catch (_err: unknown) {
      return;
    }
  }
}
