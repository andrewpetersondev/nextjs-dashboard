import "server-only";
import { redirect } from "next/navigation";
import { LOGIN_PATH } from "@/features/auth/lib/auth.constants";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { SessionVerificationResult } from "@/features/auth/sessions/session-payload.types";
import { verifySessionOptimistic } from "@/server/auth/session/session";
import { serverLogger } from "@/server/logging/serverLogger";

const hasValue = <T>(v: T | undefined | null): v is T => v !== null;

/**
 * Returns true if the user's role is included in the allowed roles list.
 */
export const hasAllowedRole = (
  userRole: UserRole | undefined,
  allowed: readonly UserRole[],
): boolean => {
  if (!hasValue(userRole)) {
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
  allowed: readonly UserRole[],
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
