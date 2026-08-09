import type { JSX } from "react";
import type { SessionVerificationDto } from "@/modules/auth/application/session/dtos/responses/session-verification.dto";
import { verifySessionOptimistic } from "@/modules/auth/presentation/session/verify-session-optimistic.action";
import type { UserRole } from "@/shared/policies/user-role/user-role.constants";
import { normalizeUserRole } from "@/shared/policies/user-role/user-role.parser";
import { NavLinks } from "@/shell/dashboard/components/nav-links";

/**
 * Server half of the sidebar navigation.
 *
 * Exists only to resolve the viewer's role and hand it to `NavLinks`, which is a
 * client component and cannot read the session itself. Splitting it this way
 * keeps the role check on the server, so the admin-only Users link is never sent
 * to a browser that should not see it.
 */
export async function DashboardNavLinks(): Promise<JSX.Element> {
	const session: SessionVerificationDto = await verifySessionOptimistic();
	const role: UserRole = normalizeUserRole(session.role);
	return <NavLinks role={role} />;
}
