import "server-only";
import {
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
import { sessionJwtAdapter } from "@/server/auth/infrastructure/adapters/session-jwt.adapter";
import { ValidationError } from "@/shared/errors/base-error.subclasses";

const parsePayloadOrThrow = (payload: EncryptPayload): EncryptPayload => {
  const parsed = EncryptPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    const errs = parsed.error.flatten().fieldErrors;
    //    serverLogger.error(
    //      { context: "createSessionToken", err: errs },
    //      "Invalid session payload",
    //    );
    console.error("Invalid session payload:", errs);
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
    //    serverLogger.error(
    //      { context: "createSessionToken", expiresAt: expMs },
    //      "expiresAt must be in the future",
    //    );
    console.error("expiresAt must be in the future:", expMs);
    throw new ValidationError(
      "Invalid session payload: expiresAt must be in the future",
      { expiresAt: ["must be in the future"] } as unknown as Record<
        string,
        unknown
      >,
    );
  }
  if (startMs <= 0 || startMs > expMs) {
    //    serverLogger.error(
    //      {
    //        context: "createSessionToken",
    //        expiresAt: expMs,
    //        sessionStart: startMs,
    //      },
    //      "sessionStart must be positive and not exceed expiresAt",
    //    );
    console.error(
      "sessionStart must be positive and not exceed expiresAt:",
      {},
    );
    throw new ValidationError(
      "Invalid session payload: sessionStart must be positive and not exceed expiresAt",
      {
        sessionStart: ["must be positive and less than or equal to expiresAt"],
      } as unknown as Record<string, unknown>,
    );
  }
};

export async function createSessionToken(
  payload: EncryptPayload,
): Promise<string> {
  const data = parsePayloadOrThrow(payload);
  const { expiresAt: expMs, sessionStart: startMs } = data.user;
  validateTemporalFields(expMs, startMs);

  const claims = flattenEncryptPayload(data);
  return await sessionJwtAdapter.encode(claims, expMs);
}

export async function readSessionToken(
  session?: string,
): Promise<DecryptPayload | undefined> {
  if (!session) {
    //    serverLogger.warn(
    //      { context: "readSessionToken" },
    //      "No session token provided",
    //    );
    console.warn("No session token provided");
    return;
  }

  const flatPayload = await sessionJwtAdapter.decode(session);
  if (!flatPayload) {
    return;
  }

  const reconstructed = unflattenEncryptPayload(flatPayload);

  // Extract exp and iat from the JWT payload
  const withClaims = {
    ...reconstructed,
    exp: flatPayload.exp ?? 0,
    iat: flatPayload.iat ?? 0,
  };

  const validatedFields = DecryptPayloadSchema.safeParse(withClaims);
  if (!validatedFields.success) {
    //    serverLogger.error(
    //      {
    //        context: "readSessionToken",
    //        err: validatedFields.error.flatten().fieldErrors,
    //      },
    //      "Session JWT payload validation failed",
    //    );
    console.error(
      "Session JWT payload validation failed:",
      validatedFields.error.flatten().fieldErrors,
    );
    return;
  }

  return validatedFields.data;
}
