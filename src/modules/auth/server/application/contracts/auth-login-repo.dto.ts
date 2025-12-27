import "server-only";

/**
 * Data Transfer Object for repository-level login lookups.
 *
 * Used by the AuthUserRepositoryPort and its implementations to
 * ensure a stable contract when fetching authentication candidates.
 */
export interface AuthLoginRepoInput {
  readonly email: string;
}
