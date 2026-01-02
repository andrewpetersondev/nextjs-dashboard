import "server-only";

import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import { userIdCodec } from "@/modules/auth/domain/schemas/session.schemas";
import type { SessionTokenService } from "@/modules/auth/infrastructure/cryptography/session-token.service";
import type { SessionTransport } from "@/modules/auth/infrastructure/serialization/session.transport";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

export type VerifySessionReason =
  | "decode_failed"
  | "invalid_claims"
  | "no_token";

export type VerifySessionResult =
  | Readonly<{ ok: false; reason: VerifySessionReason }>
  | Readonly<{ ok: true; value: SessionTransport }>;

export type VerifySessionDeps = Readonly<{
  logger: LoggingClientContract;
  store: SessionStoreContract;
  tokenService: SessionTokenService;
}>;

/**
 * VerifySessionUseCase
 *
 * Single-capability query:
 * - Reads token from store
 * - Decodes and validates claims
 * - Returns session transport or failure reason
 *
 * No side effects on failure (does not delete invalid tokens).
 */
export class VerifySessionQuery {
  private readonly logger: LoggingClientContract;
  private readonly store: SessionStoreContract;
  private readonly tokenService: SessionTokenService;

  constructor(deps: VerifySessionDeps) {
    this.logger = deps.logger.child({
      scope: "use-case",
      useCase: "verifySession",
    });
    this.store = deps.store;
    this.tokenService = deps.tokenService;
  }

  async execute(): Promise<VerifySessionResult> {
    const token = await this.store.get();

    if (!token) {
      this.logger.operation("debug", "No session token found", {
        operationContext: "session",
        operationIdentifiers: { reason: "no_token" },
        operationName: "session.verify.no_token",
      });
      return { ok: false, reason: "no_token" };
    }

    const decodedResult = await this.tokenService.decode(token);

    if (!decodedResult.ok) {
      this.logger.operation("warn", "Session token decode failed", {
        operationContext: "session",
        operationIdentifiers: { reason: "decode_failed" },
        operationName: "session.verify.decode_failed",
      });
      return { ok: false, reason: "decode_failed" };
    }

    const decoded = decodedResult.value;

    if (!decoded.userId) {
      this.logger.operation("warn", "Session missing userId", {
        operationContext: "session",
        operationIdentifiers: { reason: "invalid_claims" },
        operationName: "session.verify.invalid_claims",
      });
      return { ok: false, reason: "invalid_claims" };
    }

    return {
      ok: true,
      value: {
        isAuthorized: true,
        role: decoded.role,
        userId: userIdCodec.decode(decoded.userId),
      },
    };
  }
}
