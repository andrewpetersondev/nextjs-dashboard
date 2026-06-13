import "server-only";
import { redirect } from "next/navigation";
import type { SessionVerificationDto } from "@/modules/auth/application/session/dtos/responses/session-verification.dto";
import { verifySessionOptimistic } from "@/modules/auth/presentation/session/verify-session-optimistic.action";
import { ADMIN_ROLE } from "@/shared/policies/user-role/user-role.constants";
import { ROUTES } from "@/shared/routing/routes";

/**
 * Authorization guards for server actions.
 *
 * Server Actions are independently invocable RPC endpoints: a crafted request
 * can reach an action without navigating through the page that hosts it, so the
 * route-level checks in `proxy.ts` (middleware) are not sufficient on their own.
 * These guards make each action enforce its own authorization — defense in
 * depth, and the real boundary for role-restricted operations (without them a
 * non-admin could replay a user-management action against a route they can
 * reach and escalate privileges).
 *
 * Both guards reuse {@link verifySessionOptimistic} (the canonical optimistic
 * session check) so there is a single source of truth for "is there a session".
 * Because that check is wrapped in React `cache`, repeated guard calls within a
 * single request resolve to one verification.
 */

/**
 * Requires a valid session. Redirects to the login page when none exists.
 *
 * @returns The verified session principal (role + userId).
 * @redirects {ROUTES.auth.login} when there is no valid session.
 */
export function requireSession(): Promise<SessionVerificationDto> {
	return verifySessionOptimistic();
}

/**
 * Requires a valid session that belongs to an admin.
 *
 * Redirects to login when unauthenticated (via {@link verifySessionOptimistic}),
 * or to the dashboard root when authenticated without the admin role. This is
 * what stops a non-admin from invoking a user-management action directly.
 *
 * @returns The verified admin session principal.
 * @redirects {ROUTES.auth.login} when unauthenticated.
 * @redirects {ROUTES.dashboard.root} when authenticated but not an admin.
 */
export async function requireAdmin(): Promise<SessionVerificationDto> {
	const session = await verifySessionOptimistic();

	if (session.role !== ADMIN_ROLE) {
		redirect(ROUTES.dashboard.root);
	}

	return session;
}
