import "server-only";

import { redirect } from "next/navigation";
import { LOGIN_PATH } from "@/features/auth/constants";
import type { AuthRole } from "@/features/auth/domain/roles";
import type { SessionVerificationResult } from "@/features/auth/sessions/dto/types";
import { verifySessionOptimistic } from "@/server/auth/session";
import { serverLogger } from "@/server/logging/serverLogger";

/**
 * Returns true if the user's role is included in the allowed roles list.
 */
export const hasAllowedRole = (
  userRole: AuthRole | undefined,
  allowed: readonly AuthRole[],
): boolean => {
  if (!userRole) {
    return false;
  }
  return allowed.includes(userRole);
};

/**
 * Ensures the current session exists and the user has one of the allowed roles.
 * If not authorized, redirects to LOGIN_PATH.
 * Returns the session verification result on success for further use.
 */
export async function ensureRolesOrRedirect(
  allowed: readonly AuthRole[],
): Promise<SessionVerificationResult> {
  const session = await verifySessionOptimistic();
  if (!hasAllowedRole(session.role, allowed)) {
    serverLogger.warn(
      {
        actual: session.role,
        context: "ensureRolesOrRedirect",
        required: allowed,
      },
      "User lacks required role(s). Redirecting.",
    );
    redirect(LOGIN_PATH);
  }
  return session;
}
