// cypress/support/dbTestConstants.ts
export const DB_TIMEOUT = 20_000;
export const E2E_EMAIL_PREFIX = "e2e_dbtest_";
export const E2E_USERNAME_PREFIX = "e2e_user_";
export const DEFAULT_E2E_PASSWORD = "P@ssw0rd!123";

export function buildE2EUser(seed: number = Date.now()) {
  return {
    email: `${E2E_EMAIL_PREFIX}${seed}@example.com`,
    password: DEFAULT_E2E_PASSWORD,
    username: `${E2E_USERNAME_PREFIX}${seed}`,
  };
}
