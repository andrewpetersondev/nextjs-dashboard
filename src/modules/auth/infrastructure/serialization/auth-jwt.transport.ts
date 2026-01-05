import type { AuthJwtSchema } from "@/modules/auth/infrastructure/serialization/auth-jwt.schema";
import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * Claims/payload shapes used for encoding/decoding session tokens.
 *
 * Codec boundary: these types exist because we encode/decode a token.
 */
export type AuthJwtTransport = AuthJwtSchema<UserRole>;
