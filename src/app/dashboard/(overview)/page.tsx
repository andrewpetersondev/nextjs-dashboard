import type { JSX } from "react";
import { verifySessionOptimistic } from "@/features/sessions/session.service";
import type { SessionVerificationResult } from "@/features/sessions/session.types";
import type { UserRole } from "@/features/users/user.types";
import { DASHBOARD_TITLES } from "@/lib/constants/ui.constants";
import { getValidUserRole } from "@/lib/utils/utils.server";
import { Dashboard } from "@/ui/dashboard/dashboard";
import { MiddlewareCard } from "@/ui/dashboard/middleware-card";

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
        <Dashboard title={DASHBOARD_TITLES.ADMIN} />
      </main>
    );
  }

  if (role === "user") {
    return (
      <main>
        <MiddlewareCard />
        <Dashboard title={DASHBOARD_TITLES.USER} />
      </main>
    );
  }

  if (role === "guest") {
    return (
      <main>
        <MiddlewareCard />
        <Dashboard title={DASHBOARD_TITLES.GUEST} />
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
