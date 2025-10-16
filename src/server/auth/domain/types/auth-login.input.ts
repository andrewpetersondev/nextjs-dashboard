import "server-only";

// Repo expects only email for login; password verified elsewhere.
export interface AuthLoginRepoInput {
  readonly email: string;
}
