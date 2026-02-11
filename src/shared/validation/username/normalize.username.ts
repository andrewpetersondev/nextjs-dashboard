/**
 * Canonicalize a username for storage and lookup.
 */
export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}
