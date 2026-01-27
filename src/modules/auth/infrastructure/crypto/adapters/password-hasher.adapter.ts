import "server-only";
import type { PasswordHasherContract } from "@/modules/auth/application/contracts/password-hasher.contract";
import type { BcryptPasswordService } from "@/modules/auth/infrastructure/crypto/services/bcrypt-password.service";
import type { Hash } from "@/shared/branding/brands";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeUnexpectedError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Adapter that implements the password hashing contract.
 *
 * This adapter bridges the application's need for password hashing
 * with the concrete {@link BcryptPasswordService} implementation,
 * providing error handling and result wrapping.
 *
 * @implements {PasswordHasherContract}
 */
export class PasswordHasherAdapter implements PasswordHasherContract {
  private readonly service: BcryptPasswordService;

  /**
   * Initializes the adapter with the bcrypt service.
   *
   * @param service - The underlying bcrypt password service.
   */
  constructor(service: BcryptPasswordService) {
    this.service = service;
  }

  /**
   * Compares a plain-text password with a hash.
   *
   * @param password - The plain-text password to check.
   * @param hash - The hashed password to compare against.
   * @returns A promise resolving to a {@link Result} containing `true` if matched, or an {@link AppError}.
   */
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

  /**
   * Hashes a plain-text password.
   *
   * @param password - The plain-text password to hash.
   * @returns A promise resolving to a {@link Result} containing the generated {@link Hash}, or an {@link AppError}.
   */
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
