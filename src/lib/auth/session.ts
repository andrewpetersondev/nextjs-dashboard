import "server-only";

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import {
	JWT_EXPIRATION,
	ONE_DAY_MS,
	SESSION_COOKIE_NAME,
	SESSION_DURATION_MS,
} from "@/src/lib/auth/constants";
import { getCookieValue } from "@/src/lib/auth/utils";
import type { UserRole } from "@/src/lib/definitions/enums";
import {
	type DecryptPayload,
	DecryptPayloadSchema,
	type EncryptPayload,
	EncryptPayloadSchema,
} from "@/src/lib/definitions/session";
import { z as zod } from "@/src/lib/definitions/zod-alias";
import { ValidationError } from "@/src/lib/errors/validation-error";
import { logger } from "@/src/lib/utils/logger";

// --- Internal Utility Types & Constants ---

/**
 * Flattens EncryptPayload for JWT compatibility.
 */
function flattenEncryptPayload(
	payload: EncryptPayload,
): Record<string, unknown> {
	return {
		userId: payload.user.userId,
		role: payload.user.role,
		expiresAt: payload.user.expiresAt,
	};
}

/**
 * Reconstructs EncryptPayload from JWT payload.
 */
function unflattenEncryptPayload(
	payload: Record<string, unknown>,
): EncryptPayload {
	return {
		user: {
			userId: payload.userId as string,
			role: payload.role as UserRole,
			expiresAt: payload.expiresAt as number,
		},
	};
}

// --- Key Management ---

let encodedKey: Uint8Array | undefined;

/**
 * Lazily retrieves and caches the session secret key as a Uint8Array.
 * @returns {Promise<Uint8Array>} The encoded session secret key.
 * @throws If SESSION_SECRET is not defined.
 */
const getEncodedKey = async (): Promise<Uint8Array> => {
	if (encodedKey) return encodedKey;
	const secret = process.env.SESSION_SECRET;
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

// --- JWT (Encrypt & Decrypt) ---

/**
 * Encrypts a session payload into a JWT.
 * @param payload - The session payload to encrypt.
 * @returns {Promise<string>} The signed JWT.
 * @throws {ValidationError} If the payload is invalid.
 */
export async function encrypt(payload: EncryptPayload): Promise<string> {
	const key = await getEncodedKey();

	const validatedFields = EncryptPayloadSchema.safeParse(payload);

	if (!validatedFields.success) {
		logger.error(
			{ err: validatedFields.error.flatten().fieldErrors, context: "encrypt" },
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
				userId: jwtPayload.userId,
				role: jwtPayload.role,
				context: "encrypt",
			},
			"Session JWT created",
		);
		return token;
	} catch (error: unknown) {
		logger.error(
			{ err: error, context: "encrypt" },
			"Session encryption failed",
		);
		throw new Error("EncryptPayload encryption failed");
	}
}

/**
 * Decrypts and validates a session JWT.
 * @param session - The JWT string to decrypt.
 * @returns {Promise<DecryptPayload | undefined>} The decrypted payload, or undefined if invalid.
 */
export async function decrypt(
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
			iat: (payload.iat as number) ?? 0,
			exp: (payload.exp as number) ?? 0,
		};

		const validatedFields = DecryptPayloadSchema.safeParse(withClaims);

		if (!validatedFields.success) {
			logger.error(
				{
					err: validatedFields.error.flatten().fieldErrors,
					context: "decrypt",
				},
				"Session decryption failed",
			);
			return undefined;
		}

		logger.debug(
			{ userId: validatedFields.data.user.userId, context: "decrypt" },
			"Session decrypted successfully",
		);
		return validatedFields.data as DecryptPayload;
	} catch (error: unknown) {
		logger.error(
			{ err: error, context: "decrypt" },
			"Session decryption failed",
		);
		return undefined;
	}
}

/**
 * Creates a new session cookie for the user.
 * @param userId - The user's unique identifier.
 * @param role - The user's role.
 * @returns {Promise<void>}
 */
export async function createSession(
	userId: string,
	role: UserRole = "user",
): Promise<void> {
	const expiresAt: number = Date.now() + SESSION_DURATION_MS;

	const session: string = await encrypt({
		user: { userId, role, expiresAt },
	});

	const cookieStore = await cookies();

	cookieStore.set(SESSION_COOKIE_NAME, session, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		expires: new Date(expiresAt),
		sameSite: "lax",
		path: "/",
	});

	logger.info(
		{ userId, role, expiresAt, context: "createSession" },
		`Session created for user ${userId} with role ${role}`,
	);
}

/**
 * Updates the session cookie's expiration if valid.
 * @returns {Promise<null | void>} Null if session is missing/expired, otherwise void.
 */
export async function updateSession(): Promise<null | void> {
	const cookieStore = await cookies();

	const rawCookie = cookieStore.get(SESSION_COOKIE_NAME);

	const session = getCookieValue(rawCookie?.value);

	if (!session) {
		logger.warn(
			{ context: "updateSession" },
			"No session cookie found to update",
		);
		return null;
	}

	const payload = await decrypt(session);

	if (!payload || !payload.user) {
		logger.warn(
			{ context: "updateSession" },
			"Session payload invalid or missing user",
		);
		return null;
	}

	const now = Date.now();

	const expiration = new Date(payload.user.expiresAt).getTime();

	if (now > expiration) {
		logger.info(
			{ userId: payload.user.userId, context: "updateSession" },
			"Session expired, not updating",
		);
		return null;
	}

	const { user } = payload;
	const newExpiration = new Date(expiration + ONE_DAY_MS).getTime();

	const minimalPayload: EncryptPayload = {
		user: {
			userId: user.userId,
			role: user.role,
			expiresAt: newExpiration,
		},
	};

	const updatedToken = await encrypt(minimalPayload);

	cookieStore.set(SESSION_COOKIE_NAME, updatedToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		expires: new Date(newExpiration),
		sameSite: "lax",
		path: "/",
	});

	logger.info(
		{ userId: user.userId, newExpiration, context: "updateSession" },
		"Session updated with new expiration",
	);
}

/**
 * Deletes the session cookie.
 * @returns {Promise<void>}
 */
export async function deleteSession(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION_COOKIE_NAME);
	logger.info({ context: "deleteSession" }, "Session cookie deleted");
}

// --- DB Session Logic (Node.js only, never import in Edge runtime) ---

/**
 * Generates a cryptographically secure random session token using the Web Crypto API.
 * Uses base64url encoding for safe transport in cookies and URLs.
 * @returns {string} The session token (base64url encoded).
 */
const generateSessionToken = (): string => {
	const array = new Uint8Array(48);
	crypto.getRandomValues(array);

	const base64 = Array.from(array, (byte) => String.fromCharCode(byte)).join(
		"",
	);
	const base64Encoded = btoa(base64)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");

	return base64Encoded;
};

/**
 * Generates a UUID using the Web Crypto API.
 * @returns {string} The UUID string.
 */
const generateUUID = (): string => {
	return crypto.randomUUID();
};

/**
 * Creates a new session in the database and sets the session cookie.
 * @param userId - The user's unique identifier.
 * @param role - The user's role.
 * @returns {Promise<void>}
 * @remarks
 *   - This function is Node.js-only and must never be imported in Edge runtime (middleware).
 *   - All user input is validated.
 */
export async function createDbSession(
	userId: string,
	role: UserRole = "user",
): Promise<void> {
	// Defensive: validate userId
	const userIdSchema = zod.string().uuid();
	if (!userIdSchema.safeParse(userId).success) {
		logger.error(
			{ userId, context: "createDbSession" },
			"Invalid userId for session creation",
		);
		throw new Error("Invalid userId");
	}

	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
	const token = generateSessionToken();

	// --- Anti-pattern resistance: never import DB code in Edge runtime ---
	// Only import here, not at module scope, to avoid accidental Edge import
	const { insertSession } = await import("@/src/lib/dal/session");

	await insertSession({
		id: generateUUID(),
		token,
		expiresAt,
		userId,
	});

	const cookieStore = await cookies();
	cookieStore.set(SESSION_COOKIE_NAME, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		expires: new Date(expiresAt),
		sameSite: "lax",
		path: "/",
	});

	logger.info(
		{ userId, role, expiresAt, context: "createDbSession" },
		`DB session created for user ${userId} with role ${role}`,
	);
}
