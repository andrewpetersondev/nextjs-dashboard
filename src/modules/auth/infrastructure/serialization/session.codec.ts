import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * Claims/payload shapes used for encoding/decoding session tokens.
 *
 * Codec boundary: these types exist because we encode/decode a token.
 */
export type AuthEncryptPayload = FlatEncryptPayload<UserRole>;

export type FlatEncryptPayload<R = string> = {
  exp: number;
  expiresAt: number;
  iat: number;
  role: R;
  sessionStart: number;
  userId: string;
};
