import "server-only";
import type { AuthSignupDalInput } from "@/server/auth/domain/types/auth-signup.input";

export function toNormalizedSignupInput(
  input: Readonly<AuthSignupDalInput>,
): AuthSignupDalInput {
  return {
    email: String(input.email).trim().toLowerCase(),
    password: input.password,
    role: input.role,
    username: String(input.username).trim(),
  };
}
