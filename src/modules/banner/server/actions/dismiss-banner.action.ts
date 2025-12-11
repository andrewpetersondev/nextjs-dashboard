"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { dismissBanner } from "@/modules/banner/server/banner-cookie";

export async function dismissBannerAction(): Promise<void> {
  await dismissBanner();
  revalidatePath("/");
}
