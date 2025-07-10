import type { JSX } from "react";
import { verifySessionOptimistic } from "@/lib/dal/session-dal";
import type { SessionVerificationResult } from "@/lib/definitions/session.types";
import type { UserRole } from "@/lib/definitions/users.types";
import { getValidUserRole } from "@/lib/utils/utils.server";
import { NavLinks } from "@/ui/dashboard/nav-links";

export async function NavLinksWrapper(): Promise<JSX.Element> {
	const session: SessionVerificationResult = await verifySessionOptimistic();
	const role: UserRole = getValidUserRole(session?.role);
	return <NavLinks role={role} />;
}
