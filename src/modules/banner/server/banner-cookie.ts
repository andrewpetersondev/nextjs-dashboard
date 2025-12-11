import "server-only";
import {
  BANNER_DISMISSED_COOKIE,
  BANNER_DISMISSED_MAX_AGE_S,
} from "@/modules/banner/domain/banner.constants";
import { createCookieService } from "@/server/cookies/cookie.factory";

export async function isBannerDismissed(): Promise<boolean> {
  const cookies = createCookieService();
  const value = await cookies.get(BANNER_DISMISSED_COOKIE);
  return value === "1";
}

export async function dismissBanner(): Promise<void> {
  const cookies = createCookieService();
  await cookies.set(BANNER_DISMISSED_COOKIE, "1", {
    maxAge: BANNER_DISMISSED_MAX_AGE_S,
  });
}
