// Node.js-only: Do not import in Edge runtime (middleware, serverless functions, etc.)

// Node.js-only imports

import "server-only";

import { cookies } from "next/headers";
import {
	SESSION_COOKIE_NAME,
	SESSION_DURATION_MS,
} from "@/src/lib/auth/constants";
import type { UserRole } from "@/src/lib/definitions/enums";
import { z as zod } from "@/src/lib/definitions/zod-alias";
import { logger } from "@/src/lib/utils/logger";

// --- DB session logic here ---
// export createDbSession, generateSessionToken, generateUUID

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
			{ context: "createDbSession", userId },
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
		expiresAt,
		id: generateUUID(),
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
