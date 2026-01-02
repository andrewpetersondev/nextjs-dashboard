import "server-only";

import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export interface CookieContract {
  delete(name: string): Promise<void>;
  get(name: string): Promise<string | undefined>;
  set(
    name: string,
    value: string,
    options?: Partial<ResponseCookie>,
  ): Promise<void>;
}
