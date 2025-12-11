import "server-only";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import type { CookiePort } from "@/server/cookies/cookie.port";

/**
 * Adapter for Next.js cookies.
 */
export class NextCookieAdapter implements CookiePort {
  async delete(name: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(name);
  }

  async get(name: string): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
  }

  async set(
    name: string,
    value: string,
    options?: Partial<ResponseCookie>,
  ): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(name, value, options);
  }
}
