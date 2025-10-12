"use server";

import type { SessionVerificationResult } from "@/features/auth/sessions/session-payload.types";
import { verifySessionOptimistic as verify } from "@/server/auth/session";

/**
 * Server action wrapper delegating to the server-only session verification.
 * Keeps features importing only from server/actions per lint policy (no direct imports from server/auth/session).
 */
export async function verifySessionOptimistic(): Promise<SessionVerificationResult> {
  return await verify();
}
