import "server-only";

import { USER_ROLE } from "@/features/auth/lib/auth.roles";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { hashPassword } from "@/server/auth/crypto/password-hasher.bcrypt";
import type { AuthSignupDalInput } from "@/server/auth/domain/types/signup.dtos";
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

  private normalize(input: AuthSignupDalInput): AuthSignupDalInput {
    return {
      email: input.email.toLowerCase().trim(),
      //@ts-expect-error
      password: input.password,
      role: input.role ?? USER_ROLE,
      username: input.username.trim(),
    };
  }

  private toRepoInput(
    input: AuthSignupDalInput,
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
    raw: AuthSignupDalInput,
  ): Promise<Result<CreateUserRepoOutput, RepoError>> {
    const input = this.normalize(raw);
    //@ts-expect-error
    const passwordHash = await hashPassword(input.password);
    const repoInput = this.toRepoInput(input, passwordHash);
    return await this.repo.createSafe(repoInput);
  }
}
