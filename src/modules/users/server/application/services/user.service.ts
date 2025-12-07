import "server-only";
import type { PasswordHasherPort } from "@/modules/auth/server/application/ports/password-hasher.port";
import type { UserUpdatePatch } from "@/modules/users/domain/types";
import type { UserDto } from "@/modules/users/domain/user.dto";
import { USER_ERROR_MESSAGES } from "@/modules/users/domain/user.messages";
import type { UserRepositoryPort } from "@/modules/users/server/application/ports/user-repository.port";
import type { UserId } from "@/shared/branding/brands";
import type { AppError } from "@/shared/errors/core/app-error.class";
import { normalizeToAppError } from "@/shared/errors/normalizers/app-error.normalizer";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Input type for updating a user via service, allowing raw password string.
 */
export type UserServiceUpdateInput = Omit<UserUpdatePatch, "password"> & {
  password?: string;
};

export class UserService {
  private readonly repo: UserRepositoryPort;
  private readonly hasher: PasswordHasherPort;
  private readonly logger: LoggingClientContract;

  constructor(
    repo: UserRepositoryPort,
    hasher: PasswordHasherPort,
    logger: LoggingClientContract,
  ) {
    this.repo = repo;
    this.hasher = hasher;
    this.logger = logger.child({ scope: "user-service" });
  }

  async createUser(input: {
    username: string;
    email: string;
    password: string;
    role: string;
  }): Promise<Result<UserDto, AppError>> {
    try {
      // Hash password before sending to repo
      const hashedPassword = await this.hasher.hash(input.password);

      const user = await this.repo.create({
        ...input,
        password: hashedPassword,
      });

      if (!user) {
        return Err(
          normalizeToAppError(
            new Error(USER_ERROR_MESSAGES.createFailed),
            "database",
          ),
        );
      }

      this.logger.info("User created successfully", {
        logging: { email: input.email, username: input.username },
      });

      return Ok(user);
    } catch (err) {
      const error = normalizeToAppError(err, "unexpected");
      this.logger.error("User creation failed", {
        error,
        logging: { email: input.email },
      });
      return Err(error);
    }
  }

  async updateUser(
    id: UserId,
    patch: UserServiceUpdateInput,
  ): Promise<Result<UserDto, AppError>> {
    try {
      let finalPatch: UserUpdatePatch;

      if (patch.password) {
        finalPatch = {
          ...patch,
          password: await this.hasher.hash(patch.password),
        } as UserUpdatePatch;
      } else {
        finalPatch = { ...patch } as UserUpdatePatch;
      }

      const updated = await this.repo.update(id, finalPatch);

      if (!updated) {
        return Err(
          normalizeToAppError(
            new Error(USER_ERROR_MESSAGES.updateFailed),
            "database",
          ),
        );
      }

      this.logger.info("User updated successfully", {
        logging: { userId: id },
      });

      return Ok(updated);
    } catch (err) {
      const error = normalizeToAppError(err, "unexpected");
      this.logger.error("User update failed", {
        error,
        logging: { userId: id },
      });
      return Err(error);
    }
  }

  async deleteUser(id: UserId): Promise<Result<UserDto, AppError>> {
    try {
      const deleted = await this.repo.delete(id);

      if (!deleted) {
        return Err(
          normalizeToAppError(
            new Error(USER_ERROR_MESSAGES.notFoundOrDeleteFailed),
            "notFound",
          ),
        );
      }

      this.logger.info("User deleted successfully", {
        logging: { userId: id },
      });

      return Ok(deleted);
    } catch (err) {
      const error = normalizeToAppError(err, "unexpected");
      this.logger.error("User deletion failed", {
        error,
        logging: { userId: id },
      });
      return Err(error);
    }
  }

  async findUserById(id: UserId): Promise<UserDto | null> {
    try {
      return await this.repo.findById(id);
    } catch (err) {
      this.logger.error(USER_ERROR_MESSAGES.readFailed, {
        error: err,
        logging: { userId: id },
      });
      return null;
    }
  }

  async findUsers(query: string, page: number): Promise<UserDto[]> {
    try {
      return await this.repo.findMany(query, page);
    } catch (err) {
      this.logger.error("Failed to fetch filtered users", {
        error: err,
        logging: { page, query },
      });
      return [];
    }
  }

  async countUsers(query: string): Promise<number> {
    try {
      return await this.repo.count(query);
    } catch (err) {
      this.logger.error("Failed to count users", {
        error: err,
        logging: { query },
      });
      return 0;
    }
  }
}
