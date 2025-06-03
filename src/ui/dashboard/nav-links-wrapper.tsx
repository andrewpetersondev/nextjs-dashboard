import { verifySessionOptimistic } from "@/src/lib/dal";
import NavLinks from "@/src/ui/dashboard/nav-links";

export default async function NavLinksWrapper() {
	const session = await verifySessionOptimistic();
	const role = session?.role;
	return <NavLinks role={role} />;
}
