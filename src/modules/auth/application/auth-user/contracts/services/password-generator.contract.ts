/**
 * Contract for generating compliant random passwords.
 *
 * Implementations must produce passwords that satisfy the shared password policy
 * and Zod schema constraints (length bounds and character class requirements).
 */
export interface PasswordGeneratorContract {
  /**
   * Generates a compliant random password.
   *
   * @param length - Desired password length within inclusive policy bounds.
   */
  generate(length: number): string;
}
