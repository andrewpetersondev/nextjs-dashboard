import type { EncryptPayload } from "@/shared/auth/sessions/zod";
import type { AuthRole } from "@/shared/auth/types";

/**
 * Flattens EncryptPayload for JWT compatibility.
 */
export function flattenEncryptPayload(
  payload: EncryptPayload,
): Record<string, unknown> {
  return {
    expiresAt: payload.user.expiresAt,
    role: payload.user.role,
    sessionStart: payload.user.sessionStart,
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
      role: payload.role as AuthRole,
      sessionStart: payload.sessionStart as number,
      userId: payload.userId as string,
    },
  };
}
