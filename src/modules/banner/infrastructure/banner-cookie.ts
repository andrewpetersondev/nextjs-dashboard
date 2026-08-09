import "server-only";
import { createBannerCookieAdapter } from "@/modules/banner/infrastructure/banner-cookie.adapter";

/**
 * Whether the current visitor has already dismissed the banner.
 *
 * Server components call this to decide whether to mount `<OneTimeBanner>`; the
 * component never checks for itself. Read-only, so it is safe during a render.
 */
export async function isBannerDismissed(): Promise<boolean> {
	const adapter = createBannerCookieAdapter();
	return await adapter.isDismissed();
}

/**
 * Records the visitor's dismissal so the banner stays gone across sessions.
 *
 * @throws When called outside a Server Function or Route Handler.
 */
export async function dismissBanner(): Promise<void> {
	const adapter = createBannerCookieAdapter();
	await adapter.dismiss();
}
