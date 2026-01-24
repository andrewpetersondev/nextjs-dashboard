import type { PasswordGeneratorContract } from "@/modules/auth/application/contracts/password-generator.contract";
import { makeRandomPassword } from "@/modules/auth/domain/policies/password.policy";

/**
 * Implementation of PasswordGeneratorContract using the domain's password policy.
 */
export class PasswordGeneratorAdapter implements PasswordGeneratorContract {
  generate(length: number): string {
    return makeRandomPassword(length);
  }
}
