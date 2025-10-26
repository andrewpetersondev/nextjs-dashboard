import "server-only";
import type { SignupData } from "@/features/auth/lib/auth.schema";

/**
 * Type guard to ensure all required signup fields are present and non-empty.
 * Returns true only if input has all required fields with valid values.
 */
export function hasRequiredSignupFields(
  input: Partial<SignupData> | null | undefined,
): input is SignupData {
  if (!input) {
    return false;
  }

  const { email, password, username } = input;

  return Boolean(
    email &&
      email.trim().length > 0 &&
      password &&
      password.length > 0 &&
      username &&
      username.trim().length > 0,
  );
}
