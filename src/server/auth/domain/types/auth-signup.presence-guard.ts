import "server-only";
import type { SignupData } from "@/features/auth/lib/auth.schema";

export function hasRequiredSignupFields(
  input: Partial<SignupData> | null | undefined,
): boolean {
  if (!input) {
    return false;
  }
  return Boolean(
    input.email &&
      input.email.length > 0 &&
      input.password &&
      input.password.length > 0 &&
      input.username &&
      input.username.length > 0,
  );
}
