import "server-only";

/**
 * Transaction boundary abstraction.
 *
 * Currently a no-op wrapper to clearly mark transactional scopes
 * without introducing behavioral changes. Replace with a real
 * unit-of-work/transaction implementation if needed.
 */
export async function withTransaction<T>(fn: () => Promise<T>): Promise<T> {
  return await fn();
}
