import "server-only";
import { createBannerCookieAdapter } from "@/modules/banner/server/banner-cookie.adapter";

export async function isBannerDismissed(): Promise<boolean> {
  const adapter = createBannerCookieAdapter();
  return await adapter.isDismissed();
}

export async function dismissBanner(): Promise<void> {
  const adapter = createBannerCookieAdapter();
  await adapter.dismiss();
}
