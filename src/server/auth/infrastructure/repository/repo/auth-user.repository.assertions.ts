import "server-only";
import type { AuthSignupDalInput } from "@/server/auth/domain/types/auth-signup.input";
import { ValidationError } from "@/shared/core/errors/domain/domain-errors";

export function assertSignupFields(input: Readonly<AuthSignupDalInput>): void {
  if (!input.email || !input.passwordHash || !input.username || !input.role) {
    throw new ValidationError("Missing required fields for signup.");
  }
}
