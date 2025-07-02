import type { JSX } from "react";
import { verifySessionOptimistic } from "@/src/lib/dal/session-dal.ts";
import type { SessionVerificationResult } from "@/src/lib/definitions/session.ts";
import type { UserRole } from "@/src/lib/definitions/users.types.ts";
import { getValidUserRole } from "@/src/lib/utils/utils.server.ts";
import { NavLinks } from "@/src/ui/dashboard/nav-links.tsx";

export async function NavLinksWrapper(): Promise<JSX.Element> {
	const session: SessionVerificationResult = await verifySessionOptimistic();
	const role: UserRole = getValidUserRole(session?.role);
	return <NavLinks role={role} />;
}
