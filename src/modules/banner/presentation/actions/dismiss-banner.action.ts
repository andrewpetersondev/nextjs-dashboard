"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { dismissBanner } from "@/modules/banner/infrastructure/banner-cookie";

/**
 * Persists dismissal of the portfolio-demo banner.
 *
 * Unguarded on purpose — unlike most actions here it touches only the caller's
 * own cookie, so there is no session worth checking. Revalidates the dashboard
 * layout segment, since that is where the `isBannerDismissed()` gate lives.
 */
export async function dismissBannerAction(): Promise<void> {
	await dismissBanner();
	revalidatePath("/dashboard", "layout");
}
