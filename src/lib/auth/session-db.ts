// Node.js-only: Do not import in Edge runtime (middleware, serverless functions, etc.)

// Node.js-only imports

import "server-only";

import { cookies } from "next/headers";
import { z as zod } from "zod";
import {
	BASE64_PADDING_REGEX,
	BASE64_PLUS_REGEX,
	BASE64_SLASH_REGEX,
	SESSION_COOKIE_NAME,
	SESSION_DURATION_MS,
} from "@/src/lib/auth/constants";
import type { UserRole } from "@/src/lib/definitions/users.types";
import { logger } from "@/src/lib/utils/logger";

// --- Db session logic here ---
// export createDbSession, generateSessionToken, generateUUID

// --- Db Session Logic (Node.js only, never import in Edge runtime) ---

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
	return btoa(base64)
		.replace(BASE64_PLUS_REGEX, "-")
		.replace(BASE64_SLASH_REGEX, "_")
		.replace(BASE64_PADDING_REGEX, "");
};

/**
 * Generates a UUID using the Web Crypto API.
 * @returns {string} The UUID string.
 */
const generateUuid = (): string => {
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _createDbSession(
	userId: string,
	role: UserRole = "user",
): Promise<void> {
	// Defensive: validate userId
	const userIdSchema = zod.string().uuid();
	if (!userIdSchema.safeParse(userId).success) {
		logger.error(
			{ context: "createDbSession", userId },
			"Invalid userId for session creation",
		);
		throw new Error("Invalid userId");
	}

	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
	const token = generateSessionToken();

	// --- Anti-pattern resistance: never import Db code in Edge runtime ---
	// Only import here, not at module scope, to avoid accidental Edge import
	const { insertSession } = await import("@/src/lib/dal/session");

	await insertSession({
		expiresAt,
		id: generateUuid(),
		token,
		userId,
	});

	const cookieStore = await cookies();
	cookieStore.set(SESSION_COOKIE_NAME, token, {
		expires: new Date(expiresAt),
		httpOnly: true,
		path: "/",
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
	});

	logger.info(
		{ context: "createDbSession", expiresAt, role, userId },
		`DB session created for user ${userId} with role ${role}`,
	);
}
