import "server-only";

import type { SessionStoreContract } from "@/modules/auth/server/application/types/contracts/session-store.contract";

/**
 * Silently cleans up an invalid session token.
 *
 * Swallows errors since cleanup is best-effort.
 */
export async function cleanupInvalidToken(
  store: SessionStoreContract,
): Promise<void> {
  try {
    await store.delete();
  } catch {
    // ignore cleanup failure - best effort
  }
}
