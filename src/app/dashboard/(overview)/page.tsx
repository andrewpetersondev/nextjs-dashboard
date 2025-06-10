import { verifySessionOptimistic } from "@/src/lib/dal";
import type { UserSessionRole } from "@/src/lib/definitions/session";
import AdminDashboard from "@/src/ui/dashboard/admin-dashboard";
import MiddlewareCard from "@/src/ui/dashboard/middleware-card";
import UserDashboard from "@/src/ui/dashboard/user-dashboard";
import type { JSX } from "react";

export const dynamic = "force-dynamic"; // force this page to be dynamic, so it doesn't get cached. otherwise, next build will fail

export default async function Page(): Promise<JSX.Element> {
	const session: {
		isAuthorized: boolean;
		userId: string;
		role: UserSessionRole;
	} = await verifySessionOptimistic();
	const userRole: UserSessionRole = session?.role;
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
