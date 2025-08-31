export const DB_TIMEOUT = 20_000;
export const E2E_EMAIL_PREFIX = "e2e_dbtest_";
export const E2E_USERNAME_PREFIX = "e2e_user_"; // kept for compatibility if referenced elsewhere
export const DEFAULT_E2E_PASSWORD = "Password123!";

export function buildE2EUser(seed: number = Date.now()) {
  // Normalize and keep one source of truth: the email local-part
  const local = `${E2E_EMAIL_PREFIX}${seed}`.toLowerCase();
  const email = `${local}@example.com`;

  // Derive username from the email local-part (matches server/task derivation)
  const username = local.replace(/[^a-zA-Z0-9_]/g, "_");

  return {
    email,
    password: DEFAULT_E2E_PASSWORD,
    username,
  };
}
