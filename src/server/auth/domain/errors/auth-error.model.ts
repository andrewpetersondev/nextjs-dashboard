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

export type AuthError =
  | {
      readonly kind: "missing_fields";
      readonly message: string;
      readonly fields: readonly SignupField[];
    }
  | {
      readonly kind: "conflict";
      readonly message: string;
      readonly targets: ReadonlyArray<"email" | "username">;
    }
  | { readonly kind: "invalid_credentials"; readonly message: string }
  | { readonly kind: "validation"; readonly message: string }
  | { readonly kind: "unexpected"; readonly message: string };
