import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { readSessionToken } from "@/features/sessions/session.jwt";
import type {
  DecryptPayload,
  SessionVerificationResult,
} from "@/features/sessions/session.types";

/**
 * Verifies the user's session using an optimistic (cookie-based) check.
 *
 * - Reads the session cookie and attempts to readSessionToken it.
 * - Validates the presence of user information in the session.
 * - Redirects to `/login` if the session is missing or invalid.
 * - Returns an object containing authorization status, user ID, and role.
 */
export const verifySessionOptimistic = cache(
  async (): Promise<SessionVerificationResult> => {
    const cookie: string | undefined = (await cookies()).get("session")?.value;
    if (!cookie) {
      console.error("No session cookie found");
      redirect("/login");
    }
    const session: DecryptPayload | undefined = await readSessionToken(cookie);
    if (!session?.user?.userId) {
      console.error("Invalid session or missing user information");
      redirect("/login");
    }
    return {
      isAuthorized: true,
      role: session.user.role,
      userId: session.user.userId,
    };
  },
);
