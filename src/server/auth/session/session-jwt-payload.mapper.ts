// Export FlatEncryptPayload so jwtVerify can be generically typed to it.
import "server-only";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import { userIdCodec } from "@/server/auth/domain/schemas/session-payload.schema";
import type { EncryptPayload } from "@/server/auth/session/session-payload.types";

export type FlatEncryptPayload = {
  expiresAt: number;
  role: UserRole;
  sessionStart: number;
  userId: string;
};

/** Flattens EncryptPayload for JWT compatibility. */
export function flattenEncryptPayload(
  payload: EncryptPayload,
): FlatEncryptPayload {
  return {
    expiresAt: payload.user.expiresAt,
    role: payload.user.role,
    sessionStart: payload.user.sessionStart,
    userId: userIdCodec.encode(payload.user.userId),
  };
}

/** Reconstructs EncryptPayload from flattened JWT payload. */
export function unflattenEncryptPayload(
  payload: FlatEncryptPayload,
): EncryptPayload {
  return {
    user: {
      expiresAt: payload.expiresAt,
      role: payload.role,
      sessionStart: payload.sessionStart,
      userId: userIdCodec.decode(payload.userId),
    },
  };
}
