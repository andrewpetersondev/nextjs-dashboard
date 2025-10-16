import "server-only";
import type { AuthSignupPayload } from "@/server/auth/domain/types/auth-signup.input";
import { ValidationError } from "@/shared/core/errors/domain/domain-errors";

export function assertSignupFields(input: Readonly<AuthSignupPayload>): void {
  if (!input.email || !input.password || !input.username || !input.role) {
    throw new ValidationError("Missing required fields for signup.");
  }
}
