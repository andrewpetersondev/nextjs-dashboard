import "server-only";
import {
  BANNER_DISMISSED_COOKIE,
  BANNER_DISMISSED_MAX_AGE_S,
} from "@/modules/banner/domain/banner.constants";
import { createCookieService } from "@/server/cookies/cookie.factory";

/**
 * Adapter for banner-related cookies.
 * Keeps cookie name + options centralized and provides semantic methods.
 */
export class BannerCookieAdapter {
  private readonly cookies = createCookieService();

  async dismiss(): Promise<void> {
    await this.cookies.set(BANNER_DISMISSED_COOKIE, "1", {
      maxAge: BANNER_DISMISSED_MAX_AGE_S,
    });
  }

  async isDismissed(): Promise<boolean> {
    const value = await this.cookies.get(BANNER_DISMISSED_COOKIE);
    return value === "1";
  }

  async clear(): Promise<void> {
    await this.cookies.delete(BANNER_DISMISSED_COOKIE);
  }
}

export function createBannerCookieAdapter(): BannerCookieAdapter {
  return new BannerCookieAdapter();
}
