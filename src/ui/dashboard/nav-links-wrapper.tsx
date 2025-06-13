import { verifySessionOptimistic } from "@/src/dal/session-dal";
import type { UserRole } from "@/src/lib/definitions/roles";
import type { SessionVerificationResult } from "@/src/lib/definitions/session";
import { getValidUserRole } from "@/src/lib/utils.server";
import NavLinks from "@/src/ui/dashboard/nav-links";
import type { JSX } from "react";

export default async function NavLinksWrapper(): Promise<JSX.Element> {
	const session: SessionVerificationResult = await verifySessionOptimistic();
	const role: UserRole = getValidUserRole(session?.role);
	return <NavLinks role={role} />;
}
