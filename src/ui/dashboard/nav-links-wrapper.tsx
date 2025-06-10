import { verifySessionOptimistic } from "@/src/dal/session-dal";
import NavLinks from "@/src/ui/dashboard/nav-links";
import type { JSX } from "react";

export default async function NavLinksWrapper(): Promise<JSX.Element> {
	const session = await verifySessionOptimistic();
	const role = session?.role;
	return <NavLinks role={role} />;
}
