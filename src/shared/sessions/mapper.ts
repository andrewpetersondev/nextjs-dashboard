import type { EncryptPayload } from "@/features/sessions/types";
import type { UserRole } from "@/features/users/types";

/**
 * Flattens EncryptPayload for JWT compatibility.
 */
export function flattenEncryptPayload(
  payload: EncryptPayload,
): Record<string, unknown> {
  return {
    expiresAt: payload.user.expiresAt,
    role: payload.user.role,
    userId: payload.user.userId,
  };
}

/**
 * Reconstructs EncryptPayload from JWT payload.
 */
export function unflattenEncryptPayload(
  payload: Record<string, unknown>,
): EncryptPayload {
  return {
    user: {
      expiresAt: payload.expiresAt as number,
      role: payload.role as UserRole,
      userId: payload.userId as string,
    },
  };
}
