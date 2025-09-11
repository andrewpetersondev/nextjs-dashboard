import "server-only";

import { jwtVerify, SignJWT } from "jose";
import type { DecryptPayload } from "@/server/auth/types";
import { DecryptPayloadSchema } from "@/server/auth/zod";
import {
  SESSION_AUDIENCE,
  SESSION_ISSUER,
  SESSION_SECRET,
} from "@/server/config/env-next";
import { serverLogger } from "@/server/logging/serverLogger";
import { MIN_HS256_KEY_LENGTH } from "@/shared/auth/sessions/constants";
import {
  flattenEncryptPayload,
  unflattenEncryptPayload,
} from "@/shared/auth/sessions/mapper";
import {
  type EncryptPayload,
  EncryptPayloadSchema,
} from "@/shared/auth/sessions/zod";
import { ValidationError } from "@/shared/errors/domain";

let encodedKey: Uint8Array | undefined;

/**
 * Lazily retrieves and caches the session secret key as a Uint8Array.
 * @returns {<Uint8Array>} The encoded session secret key.
 */
const getEncodedKey = (): Uint8Array => {
  if (encodedKey) {
    return encodedKey;
  }
  const secret = SESSION_SECRET;
  if (!secret) {
    serverLogger.error(
      { context: "getEncodedKey" },
      "SESSION_SECRET is not defined",
    );
    throw new Error("SESSION_SECRET is not defined");
  }
  if (secret.length < MIN_HS256_KEY_LENGTH) {
    serverLogger.error(
      { context: "getEncodedKey", length: secret.length },
      "SESSION_SECRET is too short; must be at least 32 characters for HS256",
    );
    throw new Error(
      "Weak SESSION_SECRET: must be at least 32 characters to ensure sufficient entropy",
    );
  }
  encodedKey = new TextEncoder().encode(secret);
  serverLogger.debug(
    { context: "getEncodedKey" },
    "Session secret key encoded and cached",
  );
  return encodedKey;
};

/**
 * Encrypts a session payload into a JWT.
 */
export async function createSessionToken(
  payload: EncryptPayload,
): Promise<string> {
  const key = getEncodedKey();
  const validatedFields = EncryptPayloadSchema.safeParse(payload);
  if (!validatedFields.success) {
    serverLogger.error(
      {
        context: "createSessionToken",
        err: validatedFields.error.flatten().fieldErrors,
      },
      "JWT signing failed: invalid session payload",
    );
    throw new ValidationError(
      "Invalid session payload: Missing or invalid required fields",
      validatedFields.error.flatten().fieldErrors as unknown as Record<
        string,
        unknown
      >,
    );
  }
  // Defensive: do not issue tokens that are already expired or expiring immediately.
  const expMs = validatedFields.data.user.expiresAt;
  if (expMs <= Date.now()) {
    serverLogger.error(
      { context: "createSessionToken", expiresAt: expMs },
      "JWT signing blocked: expiresAt must be in the future",
    );
    throw new ValidationError(
      "Invalid session payload: expiresAt must be in the future",
      {
        expiresAt: ["must be in the future"],
      } as unknown as Record<string, unknown>,
    );
  }
  const jwtPayload = flattenEncryptPayload(validatedFields.data);
  try {
    let signer = new SignJWT(jwtPayload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime(new Date(validatedFields.data.user.expiresAt));
    if (SESSION_ISSUER) {
      signer = signer.setIssuer(SESSION_ISSUER);
    }
    if (SESSION_AUDIENCE) {
      signer = signer.setAudience(SESSION_AUDIENCE);
    }
    const token = await signer.sign(key);
    serverLogger.info(
      {
        context: "createSessionToken",
        role: jwtPayload.role,
        userId: jwtPayload.userId,
      },
      "Session JWT created",
    );
    return token;
  } catch (error: unknown) {
    serverLogger.error(
      { context: "createSessionToken", err: error },
      "JWT signing failed",
    );
    throw new Error("Failed to sign session token");
  }
}

/**
 * Decrypts and validates a session JWT.
 */
export async function readSessionToken(
  session?: string,
): Promise<DecryptPayload | undefined> {
  if (!session) {
    serverLogger.warn(
      { context: "readSessionToken" },
      "No session token provided",
    );
    return;
  }
  const key = getEncodedKey();
  try {
    const verifyOptions: Parameters<typeof jwtVerify>[2] = {
      algorithms: ["HS256"],
      audience: SESSION_AUDIENCE,
      clockTolerance: "5s",
      issuer: SESSION_ISSUER,
    };
    const { payload } = await jwtVerify(session, key, verifyOptions);
    const reconstructed = unflattenEncryptPayload(payload);
    const withClaims = {
      ...reconstructed,
      exp: (payload.exp as number) ?? 0,
      iat: (payload.iat as number) ?? 0,
    };
    const validatedFields = DecryptPayloadSchema.safeParse(withClaims);
    if (!validatedFields.success) {
      serverLogger.error(
        {
          context: "readSessionToken",
          err: validatedFields.error.flatten().fieldErrors,
        },
        "Session JWT payload validation failed",
      );
      return;
    }
    const data = validatedFields.data as unknown as DecryptPayload;
    serverLogger.debug(
      { context: "readSessionToken", userId: data.user.userId },
      "Session verified successfully",
    );
    return data;
  } catch (error: unknown) {
    serverLogger.error(
      { context: "readSessionToken", err: error },
      "Session JWT verification failed",
    );
    return;
  }
}
