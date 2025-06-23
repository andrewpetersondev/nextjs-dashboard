/// <reference types="cypress" />
/// <reference path="../cypress.d.ts" />

import { SignJWT } from "jose";
import { SESSION_DURATION_MS } from "../../src/lib/auth/constants";
import type { UserRole } from "../../src/lib/definitions/enums";

/**
 * Generates a mock session JWT for Cypress E2E tests.
 * Payload matches production: { expiresAt, role, userId }
 * @param userId - The user's unique identifier.
 * @param role - The user's role.
 * @returns A signed JWT string.
 */
export async function generateMockSessionJWT(
	userId: string,
	role: UserRole = "user",
): Promise<string> {
	// Use the test session secret from Cypress env
	const secret = Cypress.env("SESSION_SECRET");
	if (!secret)
		throw new Error("SESSION_SECRET is not defined in Cypress environment");
	const key = new TextEncoder().encode(secret);

	const expiresAt = Date.now() + SESSION_DURATION_MS;

	// Flat payload to match production
	const jwtPayload = {
		expiresAt,
		role,
		userId,
	};

	// Use .setExpirationTime in seconds (UNIX timestamp)
	return await new SignJWT(jwtPayload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(Math.floor(expiresAt / 1000))
		.sign(key);
}
