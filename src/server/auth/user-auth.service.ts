import "server-only";
import type {
  LoginData,
  LoginField,
  SignupData,
  SignupField,
} from "@/features/auth/lib/auth.schema";
import type { UserDto } from "@/features/users/lib/dto";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { comparePassword, hashPassword } from "@/server/auth/hashing";
import { asPasswordHash } from "@/server/auth/types/password.types";
import { AuthUserRepo } from "@/server/auth/user-auth.repository";
import type { Database } from "@/server/db/connection";
import { serverLogger } from "@/server/logging/serverLogger";
import { userEntityToDto } from "@/server/users/mapping/user.mappers";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain-error";
import type { Result } from "@/shared/core/result/result";
import { Err, Ok } from "@/shared/core/result/result";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";

/**
 * Auth service: orchestrates business logic, returns discriminated Result.
 * Never throws; always returns Result union for UI.
 */
export class UserAuthFlowService {
  protected readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Signup: hashes password, delegates to repo, returns Result<UserDto, DenseErrorMap>.
   * Orchestration and cross-entity invariants (if any) remain here; uses repo.withTransaction when atomicity is required.
   */
  async signup(
    input: SignupData,
  ): Promise<Result<UserDto, DenseFieldErrorMap<SignupField>>> {
    if (!input.email || !input.password || !input.username) {
      return Err({
        email: ["Missing required fields"],
        password: ["Missing required fields"],
        username: ["Missing required fields"],
      } as DenseFieldErrorMap<SignupField>);
    }

    const repo = new AuthUserRepo(this.db);

    try {
      const email = input.email.trim().toLowerCase();
      const username = input.username.trim();

      const hashed = await hashPassword(input.password as unknown as string);
      const passwordHash = asPasswordHash(hashed);

      // Example transaction boundary for future multi-write invariants (e.g., audit log, welcome email outbox)
      const created = await repo.withTransaction(async (tx) => {
        // Single write today; keep pattern ready for multi-entity invariants
        return await tx.signup({
          email,
          passwordHash,
          role: toUserRole("USER"),
          username,
        });
      });

      const dto = userEntityToDto(created);
      return Ok(dto);
    } catch (err: unknown) {
      if (err instanceof ConflictError) {
        return Err({
          email: ["Email already in use"],
          password: [],
          username: ["Username already in use"],
        } as DenseFieldErrorMap<SignupField>);
      }
      if (err instanceof ValidationError) {
        return Err({
          email: ["Invalid data"],
          password: [],
          username: [],
        } as DenseFieldErrorMap<SignupField>);
      }
      serverLogger.error(
        { context: "service.UserAuthFlowService.signup", kind: "unexpected" },
        "Unexpected error during signup",
      );
      return Err({
        email: ["Unexpected error occurred"],
        password: [],
        username: [],
      } as DenseFieldErrorMap<SignupField>);
    }
  }

  /**
   * Login: fetch user by email, compare raw vs stored hash in Service.
   */
  async login(
    input: LoginData,
  ): Promise<Result<UserDto, DenseFieldErrorMap<LoginField>>> {
    const repo = new AuthUserRepo(this.db);

    try {
      const user = await repo.login({ email: input.email });

      if (!user.password || typeof user.password !== "string") {
        serverLogger.error(
          { context: "service.UserAuthFlowService.login" },
          "Missing hashed password on user entity; cannot authenticate",
        );
        throw new UnauthorizedError("Invalid email or password.");
      }

      const ok = await comparePassword(
        input.password as unknown as string,
        user.password as unknown as string,
      );
      if (!ok) {
        throw new UnauthorizedError("Invalid email or password.");
      }

      const dto = userEntityToDto(user);
      return Ok(dto);
    } catch (err: unknown) {
      if (err instanceof UnauthorizedError) {
        return Err({
          email: ["Invalid email or password"],
          password: ["Invalid email or password"],
        } as DenseFieldErrorMap<LoginField>);
      }
      if (err instanceof ValidationError) {
        return Err({
          email: ["Invalid data"],
          password: [],
        } as DenseFieldErrorMap<LoginField>);
      }
      serverLogger.error(
        { context: "service.UserAuthFlowService.login", kind: "unexpected" },
        "Unexpected error during login",
      );
      return Err({
        email: ["Unexpected error occurred"],
        password: [],
      } as DenseFieldErrorMap<LoginField>);
    }
  }
}
