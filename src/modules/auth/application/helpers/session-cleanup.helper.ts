import "server-only";

import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";

/**
 * Silently cleans up an invalid session token.
 * Centralized in application services because it orchestrates infrastructure cleanup.
 *
 * Swallows errors since cleanup is best-effort.
 */
export async function cleanupInvalidToken(
  sessionStore: SessionStoreContract,
): Promise<void> {
  try {
    await sessionStore.delete();
  } catch {
    // ignore cleanup failure - best effort
  }
}
