import type { JSX } from "react";
import { verifySessionOptimistic } from "@/src/lib/dal/session-dal";
import type { SessionVerificationResult } from "@/src/lib/definitions/session";
import type { UserRole } from "@/src/lib/definitions/users.types";
import { getValidUserRole } from "@/src/lib/utils/utils.server";
import { NavLinks } from "@/src/ui/dashboard/nav-links";

export async function NavLinksWrapper(): Promise<JSX.Element> {
	const session: SessionVerificationResult = await verifySessionOptimistic();
	const role: UserRole = getValidUserRole(session?.role);
	return <NavLinks role={role} />;
}
