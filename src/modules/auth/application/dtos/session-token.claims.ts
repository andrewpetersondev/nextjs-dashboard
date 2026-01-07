import type { SessionClaimsSchema } from "@/modules/auth/domain/schemas/session-claims.schema";
import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * Claims/payload shapes used for encoding/decoding session tokens.
 *
 * Codec boundary: these types exist because we encode/decode a token.
 */
export type SessionTokenClaims = SessionClaimsSchema<UserRole>;
