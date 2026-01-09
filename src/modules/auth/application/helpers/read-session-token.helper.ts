import "server-only";

import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { SessionTokenClaims } from "@/modules/auth/application/dtos/session-token.claims";
import { cleanupInvalidTokenHelper } from "@/modules/auth/application/helpers/session-cleanup.helper";
import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

export type ReadSessionTokenOutcome =
  | { kind: "missing_token" }
  | { kind: "invalid_token"; didCleanup: boolean }
  | {
      kind: "decoded";
      decoded: SessionTokenClaims;
    };

/**
 * Centralizes session token retrieval and decoding.
 */
export async function readSessionTokenHelper(
  deps: Readonly<{
    sessionCookieAdapter: SessionStoreContract;
    sessionTokenAdapter: SessionTokenServiceContract;
  }>,
  options: Readonly<{
    cleanupOnInvalidToken: boolean;
  }>,
): Promise<Result<ReadSessionTokenOutcome, AppError>> {
  const token = await deps.sessionCookieAdapter.get();

  if (!token) {
    return Ok({ kind: "missing_token" });
  }

  const decodedResult = await deps.sessionTokenAdapter.decode(token);

  if (!decodedResult.ok) {
    let didCleanup = false;
    if (options.cleanupOnInvalidToken) {
      await cleanupInvalidTokenHelper(deps.sessionCookieAdapter);
      didCleanup = true;
    }

    if (decodedResult.error.key === "unexpected") {
      return Err(decodedResult.error);
    }

    return Ok({ didCleanup, kind: "invalid_token" });
  }

  return Ok({
    decoded: decodedResult.value,
    kind: "decoded",
  });
}
