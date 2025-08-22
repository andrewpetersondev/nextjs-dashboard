import "server-only";

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { SESSION_SECRET } from "@/config/environment";
import { ValidationError } from "@/errors/errors";
import {
  DecryptPayloadSchema,
  EncryptPayloadSchema,
} from "@/features/sessions/schema";
import type { DecryptPayload, EncryptPayload } from "@/features/sessions/types";
import type { UserRole } from "@/features/users/user.types";
import { logger } from "@/server/logging/logger";
import {
  JWT_EXPIRATION,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
} from "@/shared/constants/auth";
import {
  flattenEncryptPayload,
  unflattenEncryptPayload,
} from "@/shared/sessions/mapper";

// --- JWT session logic here ---
// export createSessionToken, readSessionToken, setSessionToken, updateSessionToken, deleteSessionToken

// --- Internal Utility Types & Constants ---

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
      .setExpirationTime(JWT_EXPIRATION)
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

// /**
//  * Updates the session cookie's expiration if valid.
//  * @returns {Promise<null | void>} Null if session is missing/expired, otherwise void.
//  */
// async function _updateSessionToken(): Promise<null | void> {
//   const cookieStore = await cookies();
//
//   const rawCookie = cookieStore.get(SESSION_COOKIE_NAME);
//
//   const session = getCookieValue(rawCookie?.value);
//
//   if (!session) {
//     logger.warn(
//       { context: "updateSession" },
//       "No session cookie found to update",
//     );
//     return null;
//   }
//
//   const payload = await readSessionToken(session);
//
//   if (!payload?.user) {
//     logger.warn(
//       { context: "updateSession" },
//       "Session payload invalid or missing user",
//     );
//     return null;
//   }
//
//   const now = Date.now();
//
//   const expiration = new Date(payload.user.expiresAt).getTime();
//
//   if (now > expiration) {
//     logger.info(
//       { context: "updateSession", userId: payload.user.userId },
//       "Session expired, not updating",
//     );
//     return null;
//   }
//
//   const { user } = payload;
//   const newExpiration = new Date(expiration + ONE_DAY_MS).getTime();
//
//   const minimalPayload: EncryptPayload = {
//     user: {
//       expiresAt: newExpiration,
//       role: user.role,
//       userId: user.userId,
//     },
//   };
//
//   const updatedToken = await createSessionToken(minimalPayload);
//
//   cookieStore.set(SESSION_COOKIE_NAME, updatedToken, {
//     expires: new Date(newExpiration),
//     httpOnly: true,
//     path: "/",
//     sameSite: "lax",
//     secure: process.env.NODE_ENV === "production",
//   });
//
//   logger.info(
//     { context: "updateSession", newExpiration, userId: user.userId },
//     "Session updated with new expiration",
//   );
// }

/**
 * Deletes the session cookie.
 * @returns {Promise<void>}
 */
export async function deleteSessionToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  logger.info({ context: "deleteSession" }, "Session cookie deleted");
}

/**
 * Creates a new session cookie for the user.
 * @param userId - The user's unique identifier.
 * @param role - The user's role.
 * @returns {Promise<void>}
 */
export async function setSessionToken(
  userId: string,
  role: UserRole = "user",
): Promise<void> {
  const expiresAt: number = Date.now() + SESSION_DURATION_MS;

  const session: string = await createSessionToken({
    user: { expiresAt, role, userId },
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, session, {
    expires: new Date(expiresAt),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  logger.info(
    { context: "createSession", expiresAt, role, userId },
    `Session created for user ${userId} with role ${role}`,
  );
}
