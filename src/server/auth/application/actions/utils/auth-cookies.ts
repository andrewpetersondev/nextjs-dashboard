// src/server/auth/application/actions/utils/auth-cookies.ts

import { cookies } from "next/headers";
import { logger } from "@/shared/logging/logger.shared";

const LOGIN_COOKIE_NAME = "login-success";
const LOGIN_COOKIE_MAX_AGE = 10;

export async function setLoginSuccessCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOGIN_COOKIE_NAME, "true", {
    httpOnly: true,
    maxAge: LOGIN_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}

export async function setCookie(
  ctx: string,
  name: string,
  age: number,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(name, "true", {
    httpOnly: true,
    maxAge: age,
    sameSite: "lax",
  });
  logger.info("Session cookie set successfully", ctx);
}
