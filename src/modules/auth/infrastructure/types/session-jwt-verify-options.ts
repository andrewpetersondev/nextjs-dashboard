import type { jwtVerify } from "jose";

/**
 * Verification options for session JWTs.
 * Defined locally to decouple the adapter logic from the underlying library's type signature.
 */
export type SessionJwtVerifyOptions = Parameters<typeof jwtVerify>[2];
