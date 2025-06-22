// cypress/support/session-mock.ts

import { SignJWT } from "jose";
import { SESSION_DURATION_MS } from "../../src/lib/auth/constants";
import type { UserRole } from "../../src/lib/definitions/enums";

/**
 * Generates a mock session JWT for Cypress E2E tests.
 * Uses a static secret for test environment only.
 * @param userId - The user's unique identifier.
 * @param role - The user's role.
 * @returns A signed JWT string.
 */
export async function generateMockSessionJWT(
	userId: string,
	role: UserRole = "user",
): Promise<string> {
	// Use a static secret for test environment only
	const secret = Cypress.env("SESSION_SECRET");

	if (!secret) {
		throw new Error("SESSION_SECRET is not defined in Cypress environment");
	}

	const key = new TextEncoder().encode(secret);

	const expiresAt = Date.now() + SESSION_DURATION_MS;

	// Match production JWT payload structure
	const jwtPayload = {
		expiresAt,
		role,
		userId,
	};

	return await new SignJWT(jwtPayload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(Math.floor(expiresAt / 1000))
		.sign(key);
}
