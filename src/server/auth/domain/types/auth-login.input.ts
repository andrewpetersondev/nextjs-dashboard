import "server-only";

/**
 * Repository/DAL input for login: raw password is verified against stored hash.
 * We do NOT pass hashes around for login.
 */
export interface AuthLoginDalInput {
  readonly email: string;
}

// Repo expects only email for login; password verified elsewhere.
export interface AuthLoginRepoInput {
  readonly email: string;
}
