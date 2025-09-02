import { DEFAULT_E2E_PASSWORD, E2E_EMAIL_PREFIX } from "./auth-forms";

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
