import type {
  DbSessionRow,
  EncryptPayload,
  SessionRecord,
} from "@/features/sessions/session.types";
import type { UserRole } from "@/features/users/user.types";

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

/**
 * Maps a DbSessionRow to a SessionRecord for use in the app layer.
 * Converts Date to ISO string and nullables to string.
 */
export function mapDbSessionToSessionRecord(row: DbSessionRow): SessionRecord {
  return {
    expiresAt: row.expiresAt.toISOString(),
    id: row.id, // Defensive: never return null, but you may want to handle this differently
    token: row.token ?? "",
    userId: row.userId ?? "",
  };
}
