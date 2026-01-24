import "server-only";
import type { PasswordHasherContract } from "@/modules/auth/application/contracts/password-hasher.contract";
import type { BcryptPasswordService } from "@/modules/auth/infrastructure/crypto/services/bcrypt-password.service";
import type { Hash } from "@/shared/branding/brands";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeUnexpectedError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * This adapter bridges the domain's need for password hashing
 * with the concrete BcryptPasswordService implementation.
 */
export class PasswordHasherAdapter implements PasswordHasherContract {
  private readonly service: BcryptPasswordService;

  constructor(service: BcryptPasswordService) {
    this.service = service;
  }

  async compare(
    password: string,
    hash: Hash,
  ): Promise<Result<boolean, AppError>> {
    try {
      const match = await this.service.compare(password, hash);
      return Ok(match);
    } catch (err) {
      return Err(
        makeUnexpectedError(err, {
          message: "Failed to compare password hash",
        }),
      );
    }
  }

  async hash(password: string): Promise<Result<Hash, AppError>> {
    try {
      const hashed = await this.service.hash(password);
      return Ok(hashed);
    } catch (err) {
      return Err(
        makeUnexpectedError(err, {
          message: "Failed to hash password",
        }),
      );
    }
  }
}
