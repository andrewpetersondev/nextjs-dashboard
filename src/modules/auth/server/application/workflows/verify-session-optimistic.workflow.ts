import "server-only";

import type { SessionService } from "@/modules/auth/server/application/services/session.service";
import type { SessionTransport } from "@/modules/auth/shared/types/transport/session.transport";
import { Ok } from "@/shared/results/result";

// todo: Result pattern uses AppError, but AppError may be overkill for this situation. Maybe AppError should be
//  used but I should refactor how NotFound is handled??
// Currently, you have a "split" in your architecture: the Result utility is strictly coupled to the AppError class, but
// your Workflows often need to return lightweight, specific failure reasons (like "no_session") that don't warrant
// the overhead of a full system error.
export type VerifySessionOptimisticFailure = Readonly<{
  reason: "no_session";
}>;

export type VerifySessionOptimisticResult =
  | Readonly<{ ok: false; error: VerifySessionOptimisticFailure }>
  | Readonly<{ ok: true; value: SessionTransport }>;

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
  const result = await deps.sessionService.read();

  // 1. Handle technical failures (e.g. JWT secret misconfigured)
  if (!result.ok) {
    // We can still choose to fail-softly for the UI, but now we know it was a REAL error
    return { error: { reason: "no_session" }, ok: false };
  }

  const session = result.value;

  // 2. Handle the "Expected Absence" (User simply isn't logged in)
  if (!session) {
    return { error: { reason: "no_session" }, ok: false };
  }

  // 3. Success
  return Ok({
    isAuthorized: true,
    role: session.role,
    userId: session.id,
  });
}
