import { makeRandomPassword } from "@/modules/auth/domain/policies/password.policy";
import type { PasswordGeneratorContract } from "@/modules/auth/domain/services/password-generator.contract";

/**
 * Implementation of PasswordGeneratorContract using the domain's password policy.
 */
export class PolicyPasswordGeneratorAdapter
  implements PasswordGeneratorContract
{
  generate(length: number): string {
    return makeRandomPassword(length);
  }
}
