import "server-only";
import { type JWTPayload, jwtVerify, SignJWT } from "jose";
import {
  CLOCK_TOLERANCE_SEC,
  JWT_ALG_HS256,
  JWT_TYP_JWT,
  MIN_HS256_KEY_LENGTH,
} from "@/server/auth/domain/constants/session.constants";
import {
  type FlatEncryptPayload,
  flattenEncryptPayload,
  unflattenEncryptPayload,
} from "@/server/auth/domain/session/codecs/session-jwt-payload.mapper";
import type {
  DecryptPayload,
  EncryptPayload,
} from "@/server/auth/domain/session/core/session-payload.types";
import {
  DecryptPayloadSchema,
  EncryptPayloadSchema,
} from "@/server/auth/domain/session/validation/session-payload.schema";
import {
  SESSION_AUDIENCE,
  SESSION_ISSUER,
  SESSION_SECRET,
} from "@/server/config/env-next";
import { serverLogger } from "@/server/logging/serverLogger";
import { ValidationError } from "@/shared/core/errors/domain/domain-errors";

// Strongly-typed, module-local cache for the encoded key
let encodedKey: Uint8Array | undefined;

// Make helper explicitly typed and readonly
const encoder: Readonly<{ encode: (s: string) => Uint8Array }> =
  new TextEncoder();

/**
 * Lazily retrieves and caches the session secret key as a Uint8Array.
 * @returns {Uint8Array} The encoded session secret key.
 */
const getEncodedKey = (): Uint8Array => {
  if (encodedKey) {
    return encodedKey;
  }
  const secret: string | undefined = SESSION_SECRET;
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
  encodedKey = encoder.encode(secret);
  serverLogger.debug(
    { context: "getEncodedKey" },
    "Session secret key encoded and cached",
  );
  return encodedKey;
};

/**
 * Parses and validates the session payload against schema or throws.
 */
const parsePayloadOrThrow = (payload: EncryptPayload): EncryptPayload => {
  const parsed = EncryptPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    const errs = parsed.error.flatten().fieldErrors;
    serverLogger.error(
      { context: "createSessionToken", err: errs },
      "JWT signing failed: invalid session payload",
    );
    throw new ValidationError(
      "Invalid session payload: Missing or invalid required fields",
      errs as unknown as Record<string, unknown>,
    );
  }
  return parsed.data;
};

const validateTemporalFields = (expMs: number, startMs: number): void => {
  const now = Date.now();
  if (expMs <= now) {
    serverLogger.error(
      { context: "createSessionToken", expiresAt: expMs },
      "JWT signing blocked: expiresAt must be in the future",
    );
    throw new ValidationError(
      "Invalid session payload: expiresAt must be in the future",
      { expiresAt: ["must be in the future"] } as unknown as Record<
        string,
        unknown
      >,
    );
  }
  if (startMs <= 0 || startMs > expMs) {
    serverLogger.error(
      {
        context: "createSessionToken",
        expiresAt: expMs,
        sessionStart: startMs,
      },
      "JWT signing blocked: sessionStart must be positive and not exceed expiresAt",
    );
    throw new ValidationError(
      "Invalid session payload: sessionStart must be positive and not exceed expiresAt",
      {
        sessionStart: ["must be positive and less than or equal to expiresAt"],
      } as unknown as Record<string, unknown>,
    );
  }
};

const signClaims = async (
  claims: FlatEncryptPayload,
  key: Uint8Array,
  expMs: number,
): Promise<string> => {
  try {
    let signer = new SignJWT(claims satisfies JWTPayload)
      .setProtectedHeader({ alg: JWT_ALG_HS256, typ: JWT_TYP_JWT })
      .setIssuedAt()
      .setExpirationTime(new Date(expMs));
    if (SESSION_ISSUER) {
      signer = signer.setIssuer(SESSION_ISSUER);
    }
    if (SESSION_AUDIENCE) {
      signer = signer.setAudience(SESSION_AUDIENCE);
    }
    const token = await signer.sign(key);
    serverLogger.debug(
      {
        context: "createSessionToken",
        role: claims.role,
        userId: claims.userId,
      },
      "Session JWT created",
    );
    return token;
  } catch (err: unknown) {
    serverLogger.error(
      { context: "createSessionToken", err },
      "JWT signing failed",
    );
    throw new Error("Failed to sign session token");
  }
};

/**
 * Build verification options for jwtVerify with precise typing.
 */
const buildVerifyOptions = (): Parameters<typeof jwtVerify>[2] => {
  return {
    algorithms: [JWT_ALG_HS256],
    clockTolerance: CLOCK_TOLERANCE_SEC,
    ...(SESSION_AUDIENCE ? { audience: SESSION_AUDIENCE } : {}),
    ...(SESSION_ISSUER ? { issuer: SESSION_ISSUER } : {}),
  } satisfies Parameters<typeof jwtVerify>[2];
};

export async function createSessionToken(
  payload: EncryptPayload,
): Promise<string> {
  const key = getEncodedKey();
  const data = parsePayloadOrThrow(payload);
  const { expiresAt: expMs, sessionStart: startMs } = data.user;
  validateTemporalFields(expMs, startMs);
  const claims: FlatEncryptPayload = flattenEncryptPayload(data);
  return await signClaims(claims, key, expMs);
}

// Ensure we use jose's generic to type payload precisely and avoid unknown indexing
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
    const verifyOptions = buildVerifyOptions();
    const { payload } = await jwtVerify<FlatEncryptPayload>(
      session,
      key,
      verifyOptions,
    );
    const reconstructed = unflattenEncryptPayload(payload);
    const withClaims = {
      ...reconstructed,
      exp: payload.exp ?? 0,
      iat: payload.iat ?? 0,
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
    const data = validatedFields.data;
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
