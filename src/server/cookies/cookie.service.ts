import "server-only";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { CookieContract } from "@/server/cookies/cookie.contract";

/**
 * Generic cookie service.
 *
 * @remarks
 * This service is intentionally policy-free: cookie mechanics (httpOnly, sameSite,
 * secure, path, expires, maxAge) are owned by feature adapters.
 */
export class CookieService {
  private readonly adapter: CookieContract;

  constructor(adapter: CookieContract) {
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
    await this.adapter.set(name, value, options);
  }
}
