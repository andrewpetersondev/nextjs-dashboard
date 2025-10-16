import "server-only";
import type { SignupData } from "@/features/auth/lib/auth.schema";

export function normalizeSignupInput(input: Readonly<SignupData>): {
  email: string;
  username: string;
  password: string;
} {
  return {
    email: String(input.email).trim().toLowerCase(),
    password: String(input.password),
    username: String(input.username).trim(),
  };
}
