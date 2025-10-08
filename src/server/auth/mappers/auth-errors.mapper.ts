// File: src/server/auth/mappers/auth-errors.mapper.ts
import "server-only";
import type { AuthServiceError } from "@/server/auth/user-auth.service";

export const mapErrorToAuthServiceUnexpected = (e: {
  readonly message?: string;
}): AuthServiceError => ({
  kind: "unexpected",
  message: e.message ?? "Unexpected error",
});
