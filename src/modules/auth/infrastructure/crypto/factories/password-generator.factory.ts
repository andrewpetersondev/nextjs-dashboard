import "server-only";
import type { PasswordGeneratorContract } from "@/modules/auth/application/contracts/password-generator.contract";
import { PasswordGeneratorService } from "@/modules/auth/infrastructure/crypto/services/password-generator.service";

/**
 * Factory for the password generator contract.
 */
export function passwordGeneratorFactory(): PasswordGeneratorContract {
  return new PasswordGeneratorService();
}
