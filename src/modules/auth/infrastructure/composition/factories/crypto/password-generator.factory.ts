import "server-only";
import type { PasswordGeneratorContract } from "@/modules/auth/application/auth-user/contracts/services/password-generator.contract";
import { PasswordGeneratorService } from "@/modules/auth/infrastructure/crypto/services/password-generator.service";

/**
 * Creates an instance of the password generator service.
 *
 * @returns An implementation of the {@link PasswordGeneratorContract}.
 */
export function passwordGeneratorFactory(): PasswordGeneratorContract {
  return new PasswordGeneratorService();
}
