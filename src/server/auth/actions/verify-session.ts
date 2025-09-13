"use server";

import { verifySessionOptimistic as verify } from "@/server/auth/session";
import type { SessionVerificationResult } from "@/shared/auth/sessions/dto/types";

/**
 * Server action wrapper delegating to the server-only session verification.
 * Keeps features importing only from server/actions per lint policy.
 */
export async function verifySessionOptimistic(): Promise<SessionVerificationResult> {
  return await verify();
}
