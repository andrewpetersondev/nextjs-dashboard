/**
 * Canonicalize an email for storage and lookup.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
