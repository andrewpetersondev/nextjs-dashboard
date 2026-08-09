import "server-only";

import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

/**
 * Port for reading and writing HTTP cookies.
 *
 * Deliberately policy-free: `httpOnly`, `sameSite`, `secure`, and lifetime are
 * chosen by whichever feature adapter sets the cookie, never here. That is what
 * lets one implementation back every cookie in the app.
 */
export interface CookieContract {
	delete(name: string): Promise<void>;
	/** Resolves to `undefined` when the cookie is absent — never throws. */
	get(name: string): Promise<string | undefined>;
	set(
		name: string,
		value: string,
		options?: Partial<ResponseCookie>,
	): Promise<void>;
}
