import type { JSX } from "react";
import type { UserRole } from "@/features/users/user.types";
import { getValidUserRole } from "@/features/users/user.utils";
import { DASHBOARD_TITLES } from "@/lib/constants/ui";
import { readDashboardDataAction } from "@/server/actions/data";
import { verifySessionOptimistic } from "@/server/services/session";
import { Dashboard } from "@/ui/dashboard/dashboard";
import { MiddlewareCard } from "@/ui/dashboard/middleware-card";

export const dynamic = "force-dynamic";

/**
 * Overview dashboard page with updated invoice integration.
 * Renders role-appropriate dashboard with new invoice schema compatibility.
 */
export default async function Page(): Promise<JSX.Element> {
  const [session, dashboardData] = await Promise.all([
    verifySessionOptimistic(),
    readDashboardDataAction(),
  ]);

  const role: UserRole = getValidUserRole(session?.role);

  const commonContent = (
    <main>
      <MiddlewareCard />
      <Dashboard
        dashboardCardData={dashboardData.cards}
        latestInvoices={dashboardData.latestInvoices}
        title={
          role === "admin"
            ? DASHBOARD_TITLES.ADMIN
            : role === "user"
              ? DASHBOARD_TITLES.USER
              : role === "guest"
                ? DASHBOARD_TITLES.GUEST
                : "Dashboard"
        }
      />
    </main>
  );

  if (["admin", "user", "guest"].includes(role)) {
    return commonContent;
  }

  return (
    <main>
      <MiddlewareCard />
      <section aria-live="polite" className="text-red-600">
        Access denied: Unknown user role.
      </section>
    </main>
  );
}
