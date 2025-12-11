import "server-only";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { CookiePort } from "@/server/cookies/cookie.port";
import { isProd } from "@/shared/config/env-shared";

/**
 * Generic cookie service with secure defaults.
 */
export class CookieService {
  private readonly adapter: CookiePort;

  constructor(adapter: CookiePort) {
    this.adapter = adapter;
  }

  async delete(name: string): Promise<void> {
    await this.adapter.delete(name);
  }

  async get(name: string): Promise<string | undefined> {
    return await this.adapter.get(name);
  }

  async set(
    name: string,
    value: string,
    options: Partial<ResponseCookie> = {},
  ): Promise<void> {
    // Apply secure defaults
    const secureOptions: Partial<ResponseCookie> = {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: isProd(),
      ...options,
    };
    await this.adapter.set(name, value, secureOptions);
  }
}
