import "server-only";

import type { SessionJwtClaims } from "@/modules/auth/infrastructure/serialization/session-jwt.claims";
import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * Claims/payload shapes used for encoding/decoding session tokens.
 *
 * Codec boundary: these types exist because we encode/decode a token.
 */
export type SessionTokenClaims = SessionJwtClaims<UserRole>;
