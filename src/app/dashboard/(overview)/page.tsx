import type { JSX } from "react";
import { verifySessionOptimistic } from "@/src/lib/dal/session-dal";
import type { SessionVerificationResult } from "@/src/lib/definitions/session.types";
import type { UserRole } from "@/src/lib/definitions/users.types";
import { getValidUserRole } from "@/src/lib/utils/utils.server";
import { Dashboard } from "@/src/ui/dashboard/dashboard";
import { MiddlewareCard } from "@/src/ui/dashboard/middleware-card";

// Constants for dashboard titles
const ADMIN_DASHBOARD_TITLE = "Admin Dashboard";
const USER_DASHBOARD_TITLE = "User Dashboard";
const GUEST_DASHBOARD_TITLE = "Guest Dashboard";

// Force this page to be dynamic to prevent build-time caching
export const dynamic = "force-dynamic";

/**
 * Overview dashboard page.
 * Renders the appropriate dashboard based on a user role.
 * @returns The dashboard page.
 */
export default async function Page(): Promise<JSX.Element> {
	const session: SessionVerificationResult = await verifySessionOptimistic();
	const role: UserRole = getValidUserRole(session?.role);

	if (role === "admin") {
		return (
			<main>
				<MiddlewareCard />
				<Dashboard title={ADMIN_DASHBOARD_TITLE} />
			</main>
		);
	}

	if (role === "user") {
		return (
			<main>
				<MiddlewareCard />
				<Dashboard title={USER_DASHBOARD_TITLE} />
			</main>
		);
	}

	if (role === "guest") {
		return (
			<main>
				<MiddlewareCard />
				<Dashboard title={GUEST_DASHBOARD_TITLE} />
			</main>
		);
	}

	// Fallback for unknown roles (defensive programming)
	return (
		<main>
			<MiddlewareCard />
			<section aria-live="polite" className="text-red-600">
				Access denied: Unknown user role.
			</section>
		</main>
	);
}
