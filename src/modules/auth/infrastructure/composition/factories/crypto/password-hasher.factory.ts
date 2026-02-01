import "server-only";
import type { PasswordHasherContract } from "@/modules/auth/application/auth-user/contracts/services/password-hasher.contract";
import { PasswordHasherAdapter } from "@/modules/auth/infrastructure/crypto/adapters/password-hasher.adapter";
import { getAuthCryptoConfig } from "@/modules/auth/infrastructure/crypto/config/auth-crypto.config";
import { BcryptPasswordService } from "@/modules/auth/infrastructure/crypto/services/bcrypt-password.service";

/**
 * Creates an instance of the password hasher contract.
 *
 * This factory initializes the {@link BcryptPasswordService} with configuration
 * and wraps it in a {@link PasswordHasherAdapter}.
 *
 * @returns An implementation of the {@link PasswordHasherContract}.
 */
export function passwordHasherFactory(): PasswordHasherContract {
  const config = getAuthCryptoConfig();

  const passwordService = new BcryptPasswordService(config.bcryptSaltRounds);
  return new PasswordHasherAdapter(passwordService);
}
