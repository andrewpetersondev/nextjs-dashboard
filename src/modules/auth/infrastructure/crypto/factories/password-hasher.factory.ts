import "server-only";
import type { PasswordHasherContract } from "@/modules/auth/application/contracts/password-hasher.contract";
import { PasswordHasherAdapter } from "@/modules/auth/infrastructure/crypto/adapters/password-hasher.adapter";
import { BcryptPasswordService } from "@/modules/auth/infrastructure/crypto/services/bcrypt-password.service";

/**
 * Factory for the password hasher contract.
 */
export function passwordHasherFactory(): PasswordHasherContract {
  const passwordService = new BcryptPasswordService();
  return new PasswordHasherAdapter(passwordService);
}
