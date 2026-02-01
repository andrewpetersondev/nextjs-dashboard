import "server-only";
import type { PasswordGeneratorContract } from "@/modules/auth/application/auth-user/contracts/services/password-generator.contract";
import { makeRandomPassword } from "@/modules/auth/domain/auth-user/policies/password.policy";

/**
 * Implementation of the password generator service.
 *
 * This service uses the domain's password policy to generate secure random passwords.
 *
 * @implements {PasswordGeneratorContract}
 */
export class PasswordGeneratorService implements PasswordGeneratorContract {
  /**
   * Generates a random password of the specified length.
   *
   * @param length - The desired length of the password.
   * @returns A randomly generated password string.
   */
  generate(length: number): string {
    return makeRandomPassword(length);
  }
}
