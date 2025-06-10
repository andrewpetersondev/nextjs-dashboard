import { verifySessionOptimistic } from "@/src/lib/dal";
import type { UserSessionRole } from "@/src/lib/definitions/session";
import NavLinks from "@/src/ui/dashboard/nav-links";
import type { JSX } from "react";

export default async function NavLinksWrapper(): Promise<JSX.Element> {
	const session: {
		isAuthorized: boolean;
		userId: string;
		role: UserSessionRole;
	} = await verifySessionOptimistic();
	const role: UserSessionRole = session?.role;
	return <NavLinks role={role} />;
}
