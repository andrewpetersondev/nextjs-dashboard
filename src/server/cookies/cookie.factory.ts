import "server-only";
import { CookieService } from "@/server/cookies/cookie.service";
import { NextCookieAdapter } from "@/server/cookies/next-cookie.adapter";

/**
 * Factory to create a CookieService with Next.js adapter.
 */
export function createCookieService(): CookieService {
  return new CookieService(new NextCookieAdapter());
}
