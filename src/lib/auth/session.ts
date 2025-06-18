import "server-only";

import {
	JWT_EXPIRATION,
	ONE_DAY_MS,
	SESSION_DURATION_MS,
} from "@/src/lib/auth/constants";
import { SESSION_COOKIE_NAME } from "@/src/lib/auth/constants";
import type { UserRole } from "@/src/lib/definitions/enums";
import {
	type DecryptPayload,
	DecryptPayloadSchema,
	type EncryptPayload,
	EncryptPayloadSchema,
} from "@/src/lib/definitions/session";
import { ValidationError } from "@/src/lib/errors/validation-error";
import { logger } from "@/src/lib/utils/logger";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Note: `encodedKey` is cached at the module level. In serverless environments (e.g., Vercel), this cache may not persist between invocations.
// For high-throughput or multi-instance deployments, consider a more robust key management strategy (e.g., KMS or a secrets manager).

// --- Key Retrieval (Optimized & Type-Safe) ---
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
		logger.error({ context: "getEncodedKey" }, "SESSION_SECRET is not defined"); // Log missing secret
		throw new Error("SESSION_SECRET is not defined");
	}
	encodedKey = new TextEncoder().encode(secret);
	logger.debug(
		{ context: "getEncodedKey" },
		"Session secret key encoded and cached",
	); // Log key caching (debug only)
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

	const validatedPayload: EncryptPayload = validatedFields.data;

	try {
		const token = await new SignJWT(validatedPayload)
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt()
			.setExpirationTime(JWT_EXPIRATION)
			.sign(key);

		logger.info(
			{
				userId: validatedPayload.user.userId,
				role: validatedPayload.user.role,
				context: "encrypt",
			},
			"Session JWT created",
		); // Log successful encryption (info)
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
		); // Warn on missing session
		return undefined;
	}

	const key = await getEncodedKey();

	try {
		const { payload } = (await jwtVerify(session, key, {
			algorithms: ["HS256"],
		})) as { payload: DecryptPayload };
		const validatedFields = DecryptPayloadSchema.safeParse(payload);

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
		); // Use debug to avoid log noise in production
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
	try {
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
		); // Log session creation
	} catch (error: unknown) {
		logger.error(
			{ err: error, context: "createSession" },
			"Failed to create session",
		);
		throw error;
	}
}

/**
 * Updates the session cookie's expiration if valid.
 * @returns {Promise<null | void>} Null if session is missing/expired, otherwise void.
 */

// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
export async function updateSession(): Promise<null | void> {
	const session = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

	if (!session) {
		logger.warn(
			{ context: "updateSession" },
			"No session cookie found to update",
		); // Warn on missing session
		return null;
	}

	const payload = await decrypt(session);

	if (!payload || !payload.user) {
		logger.warn(
			{ context: "updateSession" },
			"Session payload invalid or missing user",
		); // Warn on invalid payload
		return null;
	}

	const now = Date.now();

	const expiration = new Date(payload.user.expiresAt).getTime();

	if (now > expiration) {
		logger.info(
			{ userId: payload.user.userId, context: "updateSession" },
			"Session expired, not updating",
		); // Info on expired session
		return null;
	}

	const { user } = payload;

	try {
		const newExpiration = new Date(expiration + ONE_DAY_MS).getTime();

		const minimalPayload = {
			user: {
				userId: user.userId,
				role: user.role,
				expiresAt: newExpiration,
			},
		};

		const updatedToken = await encrypt(minimalPayload);

		const cookieStore = await cookies();

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
		); // Log session update
	} catch (error) {
		logger.error(
			{ err: error, context: "updateSession" },
			"Failed to update session",
		);
	}
}

/**
 * Deletes the session cookie.
 * @returns {Promise<void>}
 */
export async function deleteSession(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION_COOKIE_NAME);
	logger.info({ context: "deleteSession" }, "Session cookie deleted"); // Log session deletion
}

// how to include db sessions
// To create and manage database sessions, you'll need to follow these steps:
// Create a table in your database to store session and data (or check if your Auth Library handles this).
// Implement functionality to insert, update, and delete sessions
// Encrypt the session ID before storing it in the user's browser, and ensure the database and cookie stay in
// sync (this is optional, but recommended for optimistic auth checks in Middleware).
