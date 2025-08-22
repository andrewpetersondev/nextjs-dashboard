import "server-only";

import { jwtVerify, SignJWT } from "jose";
import type { DecryptPayload } from "@/server/auth/types";
import { DecryptPayloadSchema } from "@/server/auth/zod";
import { SESSION_SECRET } from "@/server/config/environment";
import { ValidationError } from "@/server/errors/errors";
import { logger } from "@/server/logging/logger";

import {
  flattenEncryptPayload,
  unflattenEncryptPayload,
} from "@/shared/auth/sessions/mapper";
import type { EncryptPayload } from "@/shared/auth/types";
import { EncryptPayloadSchema } from "@/shared/auth/zod";

let encodedKey: Uint8Array | undefined;

/**
 * Lazily retrieves and caches the session secret key as a Uint8Array.
 * @returns {Promise<Uint8Array>} The encoded session secret key.
 * @throws If SESSION_SECRET is not defined.
 */
const getEncodedKey = async (): Promise<Uint8Array> => {
  if (encodedKey) {
    return encodedKey;
  }
  const secret = SESSION_SECRET;
  if (!secret) {
    logger.error({ context: "getEncodedKey" }, "SESSION_SECRET is not defined");
    throw new Error("SESSION_SECRET is not defined");
  }
  encodedKey = new TextEncoder().encode(secret);
  logger.debug(
    { context: "getEncodedKey" },
    "Session secret key encoded and cached",
  );
  return encodedKey;
};

/**
 * Encrypts a session payload into a JWT.
 * @param payload - The session payload to createSessionToken.
 * @returns {Promise<string>} The signed JWT.
 * @throws {ValidationError} If the payload is invalid.
 */
export async function createSessionToken(
  payload: EncryptPayload,
): Promise<string> {
  const key = await getEncodedKey();

  const validatedFields = EncryptPayloadSchema.safeParse(payload);

  if (!validatedFields.success) {
    logger.error(
      {
        context: "createSessionToken",
        err: validatedFields.error.flatten().fieldErrors,
      },
      "Session encryption failed",
    );
    throw new ValidationError(
      "Invalid session payload: Missing or invalid required fields",
      validatedFields.error.flatten().fieldErrors,
    );
  }

  const jwtPayload = flattenEncryptPayload(validatedFields.data);

  try {
    const token = await new SignJWT(jwtPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(new Date(validatedFields.data.user.expiresAt))
      .sign(key);

    logger.info(
      {
        context: "createSessionToken",
        role: jwtPayload.role,
        userId: jwtPayload.userId,
      },
      "Session JWT created",
    );
    return token;
  } catch (error: unknown) {
    logger.error(
      { context: "createSessionToken", err: error },
      "Session encryption failed",
    );
    throw new Error("EncryptPayload encryption failed");
  }
}

/**
 * Decrypts and validates a session JWT.
 * @param session - The JWT string to readSessionToken.
 * @returns {Promise<DecryptPayload | undefined>} The decrypted payload, or undefined if invalid.
 */
export async function readSessionToken(
  session?: string,
): Promise<DecryptPayload | undefined> {
  if (!session) {
    logger.warn(
      { context: "decrypt" },
      "No session token provided for decryption",
    );
    return undefined;
  }

  const key = await getEncodedKey();

  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });

    const reconstructed = unflattenEncryptPayload(payload);

    const withClaims = {
      ...reconstructed,
      exp: (payload.exp as number) ?? 0,
      iat: (payload.iat as number) ?? 0,
    };

    const validatedFields = DecryptPayloadSchema.safeParse(withClaims);

    if (!validatedFields.success) {
      logger.error(
        {
          context: "decrypt",
          err: validatedFields.error.flatten().fieldErrors,
        },
        "Session decryption failed",
      );
      return undefined;
    }

    logger.debug(
      { context: "decrypt", userId: validatedFields.data.user.userId },
      "Session decrypted successfully",
    );
    return validatedFields.data as DecryptPayload;
  } catch (error: unknown) {
    logger.error(
      { context: "decrypt", err: error },
      "Session decryption failed",
    );
    return undefined;
  }
}
