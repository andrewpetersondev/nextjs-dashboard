import "server-only";

import type { DecryptPayload } from "@/src/lib/definitions/session";
import { decrypt } from "@/src/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

/**
 * Verifies the user's session using an optimistic (cookie-based) check.
 *
 * - Reads the session cookie and attempts to decrypt it.
 * - Validates the presence of user information in the session.
 * - Redirects to `/login` if the session is missing or invalid.
 * - Returns an object containing authorization status, user ID, and role.
 *
 * @returns {Promise<{ isAuthorized: true; userId: string; role: string }>} User session info if valid.
 * @throws Redirects to `/login` if session is invalid or missing.
 *
 * @example
 * const session = await verifySessionOptimistic();
 * if (session.isAuthorized) {
 *   // Proceed with authorized logic
 * }
 */
export const verifySessionOptimistic = cache(
	async (): Promise<{ isAuthorized: true; userId: string; role: string }> => {
		const cookie: string | undefined = (await cookies()).get("session")?.value;
		if (!cookie) {
			console.error("No session cookie found");
			redirect("/login");
		}
		const session: DecryptPayload | undefined = await decrypt(cookie);
		if (!session || !session.user || !session.user.userId) {
			console.error("Invalid session or missing user information");
			redirect("/login");
		}
		return {
			isAuthorized: true,
			userId: session.user.userId,
			role: session.user.role,
		};
	},
);
