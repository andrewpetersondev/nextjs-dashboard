import { SignJWT } from "jose";
import type { UserRole } from "@/features/users/user.types.ts";
import { SESSION_DURATION_MS } from "@/features/sessions/session.ui.constants.ts";

export async function generateMockSessionJwt(
  userId: string,
  role: UserRole = "user",
): Promise<string> {
  const secret = Cypress.env("SESSION_SECRET");
  if (!secret) {
    throw new Error("SESSION_SECRET is not defined in Cypress environment");
  }
  const key = new TextEncoder().encode(secret);
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const jwtPayload = {
    expiresAt,
    role,
    userId,
  };
  return await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(key);
}
