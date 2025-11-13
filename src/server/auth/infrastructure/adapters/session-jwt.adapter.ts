import "server-only";
import { type JWTPayload, jwtVerify, SignJWT } from "jose";
import {
  CLOCK_TOLERANCE_SEC,
  JWT_ALG_HS256,
  JWT_TYP_JWT,
  MIN_HS256_KEY_LENGTH,
} from "@/server/auth/domain/constants/session.constants";
import type { FlatEncryptPayload } from "@/server/auth/domain/session/codecs/session-jwt-payload.mapper";
import {
  SESSION_AUDIENCE,
  SESSION_ISSUER,
  SESSION_SECRET,
} from "@/server/config/env-server";

let encodedKey: Uint8Array | undefined;
const encoder: Readonly<{ encode: (s: string) => Uint8Array }> =
  new TextEncoder();

const getEncodedKey = (): Uint8Array => {
  if (encodedKey) {
    return encodedKey;
  }

  const secret = SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not defined");
  }
  if (secret.length < MIN_HS256_KEY_LENGTH) {
    throw new Error("Weak SESSION_SECRET: must be at least 32 characters");
  }
  encodedKey = encoder.encode(secret);
  return encodedKey;
};

const buildVerifyOptions = (): Parameters<typeof jwtVerify>[2] => ({
  algorithms: [JWT_ALG_HS256],
  clockTolerance: CLOCK_TOLERANCE_SEC,
  ...(SESSION_AUDIENCE ? { audience: SESSION_AUDIENCE } : {}),
  ...(SESSION_ISSUER ? { issuer: SESSION_ISSUER } : {}),
});

export class SessionJwtAdapter {
  async encode(
    claims: FlatEncryptPayload,
    expiresAtMs: number,
  ): Promise<string> {
    const key = getEncodedKey();
    try {
      let signer = new SignJWT(claims satisfies JWTPayload)
        .setProtectedHeader({ alg: JWT_ALG_HS256, typ: JWT_TYP_JWT })
        .setIssuedAt()
        .setExpirationTime(new Date(expiresAtMs));

      if (SESSION_ISSUER) {
        signer = signer.setIssuer(SESSION_ISSUER);
      }
      if (SESSION_AUDIENCE) {
        signer = signer.setAudience(SESSION_AUDIENCE);
      }
      const token = await signer.sign(key);
      const tokenPreview = token.slice(0, 10);
      console.info("Session JWT created:", {
        tokenPreview,
        userId: claims.userId,
      });
      return token;
    } catch (err: unknown) {
      console.error("JWT signing failed:", err);
      throw new Error("Failed to sign session token");
    }
  }

  async decode(token: string): Promise<FlatEncryptPayload | undefined> {
    const key = getEncodedKey();
    try {
      const verifyOptions = buildVerifyOptions();
      const { payload } = await jwtVerify<FlatEncryptPayload>(
        token,
        key,
        verifyOptions,
      );
      return payload;
    } catch (error: unknown) {
      console.error("JWT verification failed:", error);
      return;
    }
  }
}

// Export singleton instance
export const sessionJwtAdapter = new SessionJwtAdapter();
