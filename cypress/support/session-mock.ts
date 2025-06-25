/// <reference types="cypress" />
/// <reference path="../../cypress.d.ts" />

import { SignJWT } from "jose";
import { SESSION_DURATION_MS } from "@/src/lib/auth/constants";
import type { UserRole } from "@/src/lib/definitions/enums";

export async function generateMockSessionJWT(
	userId: string,
	role: UserRole = "user",
): Promise<string> {
	const secret = Cypress.env("SESSION_SECRET");
	if (!secret)
		throw new Error("SESSION_SECRET is not defined in Cypress environment");
	const key = new TextEncoder().encode(secret);
	const expiresAt = Date.now() + SESSION_DURATION_MS;
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
