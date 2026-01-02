import "server-only";

import type { SessionService } from "@/modules/auth/application/services/session.service";
import type { SessionTransport } from "@/modules/auth/infrastructure/serialization/session.transport";

export type VerifySessionOptimisticFailure = Readonly<{
  reason: "decode_failed" | "invalid_claims" | "no_session";
}>;

export type VerifySessionOptimisticResult =
  | Readonly<{ ok: false; error: VerifySessionOptimisticFailure }>
  | Readonly<{ ok: true; value: SessionTransport }>;

/**
 * Optimistically verifies the current session (cookie/JWT based).
 *
 * Framework-agnostic workflow that delegates to SessionService.
 */
export async function verifySessionOptimisticWorkflow(
  deps: Readonly<{
    sessionService: SessionService;
  }>,
): Promise<VerifySessionOptimisticResult> {
  const result = await deps.sessionService.verify();

  if (!result.ok) {
    return {
      error: {
        reason: result.reason === "no_token" ? "no_session" : result.reason,
      },
      ok: false,
    };
  }

  return { ok: true, value: result.value };
}
