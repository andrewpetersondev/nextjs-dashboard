import "server-only";
import {
  BANNER_DISMISSED_COOKIE,
  BANNER_DISMISSED_MAX_AGE_S,
} from "@/modules/banner/domain/banner.constants";
import { createCookieService } from "@/server/cookies/cookie.factory";
import { isProd } from "@/shared/core/config/env-shared";

const BANNER_COOKIE_HTTPONLY = false as const;
const BANNER_COOKIE_PATH = "/" as const;
const BANNER_COOKIE_SAMESITE = "lax" as const;

export class BannerCookieAdapter {
  private readonly cookies = createCookieService();

  async dismiss(): Promise<void> {
    await this.cookies.set(BANNER_DISMISSED_COOKIE, "1", {
      httpOnly: BANNER_COOKIE_HTTPONLY,
      maxAge: BANNER_DISMISSED_MAX_AGE_S,
      path: BANNER_COOKIE_PATH,
      sameSite: BANNER_COOKIE_SAMESITE,
      secure: isProd(),
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
