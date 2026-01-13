import "server-only";

import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";

/**
 * Silently cleans up an invalid session token.
 * Centralized in application services because it orchestrates infrastructure cleanup.
 *
 * Swallows errors since cleanup is best-effort.
 */
export async function cleanupInvalidTokenHelper(
  sessionStore: SessionStoreContract,
): Promise<void> {
  try {
    await sessionStore.delete();
  } catch {
    // ignore cleanup failure - best effort
  }
}
