import { makeRandomPassword } from "@/modules/auth/domain/policies/password.policy";
import type { PasswordGeneratorContract } from "@/modules/auth/domain/services/password-generator.contract";

export class PasswordGeneratorAdapter implements PasswordGeneratorContract {
  generate(length: number): string {
    return makeRandomPassword(length);
  }
}
