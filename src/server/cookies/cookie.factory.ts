import "server-only";
import { CookieService } from "@/server/cookies/cookie.service";
import { NextJsCookieAdapter } from "@/server/cookies/next-js-cookie.adapter";

/**
 * Factory to create a CookieService with Next.js adapter.
 */
export function createCookieService(): CookieService {
	return new CookieService(new NextJsCookieAdapter());
}
