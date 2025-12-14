import "server-only";

import type { SessionVerificationResult } from "@/modules/auth/domain/session/session.transport";
import type { SessionService } from "@/modules/auth/server/application/services/session.service";

export type VerifySessionOptimisticFailure = Readonly<{
  reason: "no_session";
}>;

export type VerifySessionOptimisticResult =
  | Readonly<{ ok: false; error: VerifySessionOptimisticFailure }>
  | Readonly<{ ok: true; value: SessionVerificationResult }>;

/**
 * Optimistically verifies the current session (cookie/JWT based).
 *
 * - No redirects here (workflow is framework-agnostic).
 * - Returns a small discriminated union so the boundary can decide what to do.
 */
export async function verifySessionOptimisticWorkflow(
  deps: Readonly<{
    sessionService: SessionService;
  }>,
): Promise<VerifySessionOptimisticResult> {
  const session = await deps.sessionService.read();

  if (!session?.userId) {
    return { error: { reason: "no_session" }, ok: false };
  }

  return {
    ok: true,
    value: {
      isAuthorized: true,
      role: session.role,
      userId: session.userId,
    },
  };
}
