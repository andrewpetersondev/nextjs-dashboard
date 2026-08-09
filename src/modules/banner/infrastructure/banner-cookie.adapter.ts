import "server-only";
import {
	BANNER_DISMISSED_COOKIE,
	BANNER_DISMISSED_MAX_AGE_S,
} from "@/modules/banner/domain/banner.constants";
import { createCookieService } from "@/server/cookies/cookie.factory";
import { isProd } from "@/shared/core/config/shared/env-shared";

/**
 * Readable to client JavaScript, on purpose — the flag names no user and grants
 * no authority. Keep this relaxed for non-sensitive UI preferences only.
 */
const BANNER_COOKIE_HTTPONLY = false as const;

/** Site-wide, so a dismissal on one dashboard route holds on every other. */
const BANNER_COOKIE_PATH = "/" as const;

/** Ordinary first-party preference; no cross-site request needs to carry it. */
const BANNER_COOKIE_SAMESITE = "lax" as const;

/**
 * Owns the cookie policy for the one-time banner.
 *
 * The shared cookie service is policy-free by design, so `httpOnly`, `sameSite`,
 * `secure`, and `maxAge` are decided here rather than at each call site.
 *
 * @see createBannerCookieAdapter
 */
class BannerCookieAdapter {
	private readonly cookies = createCookieService();

	/**
	 * Records the dismissal, restarting the 180-day window.
	 *
	 * @throws When called outside a Server Function or Route Handler.
	 */
	async dismiss(): Promise<void> {
		await this.cookies.set(BANNER_DISMISSED_COOKIE, "1", {
			httpOnly: BANNER_COOKIE_HTTPONLY,
			maxAge: BANNER_DISMISSED_MAX_AGE_S,
			path: BANNER_COOKIE_PATH,
			sameSite: BANNER_COOKIE_SAMESITE,
			secure: isProd(),
		});
	}

	/**
	 * Whether this browser dismissed the banner at its current version.
	 *
	 * @returns `true` only for the exact value `"1"`; anything else reads as not
	 * dismissed, so the banner fails toward being shown.
	 */
	async isDismissed(): Promise<boolean> {
		const value = await this.cookies.get(BANNER_DISMISSED_COOKIE);
		return value === "1";
	}

	/**
	 * Forgets the dismissal so the banner returns. No caller today; kept for
	 * manual QA.
	 *
	 * @throws When called outside a Server Function or Route Handler.
	 */
	async clear(): Promise<void> {
		await this.cookies.delete(BANNER_DISMISSED_COOKIE);
	}
}

/**
 * Builds a banner cookie adapter.
 *
 * @returns A fresh adapter. The cookie service is request-scoped, so it must not
 * outlive the request that made it.
 */
export function createBannerCookieAdapter(): BannerCookieAdapter {
	return new BannerCookieAdapter();
}
