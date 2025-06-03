import { verifySessionOptimistic } from "@/src/lib/dal";
import AdminDashboard from "@/src/ui/dashboard/admin-dashboard";
import MiddlewareCard from "@/src/ui/dashboard/middleware-card";
import UserDashboard from "@/src/ui/dashboard/user-dashboard";

export const dynamic = "force-dynamic"; // force this page to be dynamic, so it doesn't get cached. otherwise, next build will fail

export default async function Page() {
	const session = await verifySessionOptimistic();
	const userRole = session?.role;
	if (userRole === "admin") {
		return (
			<div>
				<MiddlewareCard />
				<AdminDashboard />
			</div>
		);
	}
	return (
		<div>
			<MiddlewareCard />
			<UserDashboard />
		</div>
	);
}
