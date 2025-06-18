import { verifySessionOptimistic } from "@/src/lib/dal/session-dal";
import type { UserRole } from "@/src/lib/definitions/enums";
import type { SessionVerificationResult } from "@/src/lib/definitions/session";
import { getValidUserRole } from "@/src/lib/utils/utils.server";
import NavLinks from "@/src/ui/dashboard/nav-links";
import type { JSX } from "react";

export default async function NavLinksWrapper(): Promise<JSX.Element> {
	const session: SessionVerificationResult = await verifySessionOptimistic();
	const role: UserRole = getValidUserRole(session?.role);
	return <NavLinks role={role} />;
}
