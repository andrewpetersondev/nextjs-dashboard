import "server-only";
import type { SignupField } from "@/features/auth/lib/auth.schema";

export const DEFAULT_MISSING_FIELDS: readonly SignupField[] = [
  "email",
  "password",
  "username",
] as const;

export const AUTH_CONFLICT_TARGETS = ["email", "username"] as const;

export const AUTH_MESSAGES = {
  conflict: "Email or username already in use",
  invalidCreds: "Invalid email or password",
  missing: "Missing required fields",
  unexpected: "Unexpected error occurred",
  validation: "Invalid data",
} as const;

export const AUTH_ACTION_CONTEXTS = {
  DEMO_USER: "demo-user.action",
  LOGIN: "login.action",
  SIGNUP: "signup.action",
} as const;
