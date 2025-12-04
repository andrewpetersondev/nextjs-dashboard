import "server-only";
import type {
  AuthLoginRepoInput,
  AuthSignupPayload,
  AuthUserEntity,
} from "@/modules/auth/domain/auth.types";

export interface AuthUserRepositoryPort<Trepo = unknown> {
  withTransaction<Tresult>(
    fn: (txRepo: AuthUserRepositoryPort<Trepo>) => Promise<Tresult>,
  ): Promise<Tresult>;

  signup(input: AuthSignupPayload): Promise<AuthUserEntity>;

  /**
   * Fetches a user suitable for login.
   *
   * Returns:
   * - AuthUserEntity when a user with a password exists
   * - null when the user is not found or lacks a password
   *
   * DAL-level errors are propagated and mapped by the repo/domain error mappers.
   */
  login(input: AuthLoginRepoInput): Promise<AuthUserEntity | null>;
}
