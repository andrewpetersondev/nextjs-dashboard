import type { JSX } from "react";
import { verifySessionOptimistic } from "@/src/lib/dal/session-dal.ts";
import type { SessionVerificationResult } from "@/src/lib/definitions/session.ts";
import type { UserRole } from "@/src/lib/definitions/users.types.ts";
import { getValidUserRole } from "@/src/lib/utils/utils.server.ts";
import { AdminDashboard } from "@/src/ui/dashboard/admin-dashboard.tsx";
import { MiddlewareCard } from "@/src/ui/dashboard/middleware-card.tsx";
import { UserDashboard } from "@/src/ui/dashboard/user-dashboard.tsx";

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this format
export const dynamic = "force-dynamic"; // force this page to be dynamic, so it doesn't get cached. otherwise, the next build will fail

// biome-ignore lint/style/noDefaultExport: page and layout probably need to be default exports
export default async function Page(): Promise<JSX.Element> {
	const session: SessionVerificationResult = await verifySessionOptimistic();

	const role: UserRole = getValidUserRole(session?.role);

	if (role === "admin") {
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
