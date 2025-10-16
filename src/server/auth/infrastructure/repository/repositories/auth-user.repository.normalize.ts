import "server-only";
import type { AuthSignupDalInput } from "@/server/auth/domain/types/auth-signup.input";

export function toNormalizedSignupInput(
  input: Readonly<AuthSignupDalInput>,
): AuthSignupDalInput {
  return {
    email: String(input.email).trim().toLowerCase(),
    passwordHash: input.passwordHash,
    role: input.role,
    username: String(input.username).trim(),
  };
}
