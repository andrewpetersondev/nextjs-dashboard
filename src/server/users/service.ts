import "server-only";
import { USER_ROLE } from "@/features/auth/lib/auth.roles";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { hashWithSaltRounds } from "@/server/auth/application/services/adapters/password-hasher-bcrypt.adapter";
import type { AuthSignupServiceInput } from "@/server/auth/domain/types/auth-signup.input";
import type {
  CreateUserRepoInput,
  CreateUserRepoOutput,
  RepoError,
  UsersRepository,
} from "@/server/users/repo";
import type { Result } from "@/shared/core/result/result";

/**
 * UsersService: business rules for users domain.
 * - Assumes data is validated by the server action.
 * - Normalizes/canonicalizes values minimally.
 * - Delegates persistence to UsersRepository.
 */
export class UsersService {
  private readonly repo: UsersRepository;

  constructor(repo: UsersRepository) {
    this.repo = repo;
  }

  private normalize(input: AuthSignupServiceInput): AuthSignupServiceInput {
    return {
      email: input.email.toLowerCase().trim(),
      password: input.password,
      role: input.role ?? USER_ROLE,
      username: input.username.trim(),
    };
  }

  private toRepoInput(
    input: AuthSignupServiceInput,
    password: string,
  ): CreateUserRepoInput {
    return {
      email: input.email,
      password,
      role: toUserRole(input.role ?? USER_ROLE),
      username: input.username,
    };
  }

  /**
   * Signup use case.
   * - Requires pre-validated input from the server action.
   * - Hashes password and persists via repository.
   * - Returns Result with created user or infrastructure error.
   */
  async signup(
    raw: AuthSignupServiceInput,
  ): Promise<Result<CreateUserRepoOutput, RepoError>> {
    const input = this.normalize(raw);
    const passwordHash = await hashWithSaltRounds(input.password);
    const repoInput = this.toRepoInput(input, passwordHash);
    return await this.repo.createSafe(repoInput);
  }
}
