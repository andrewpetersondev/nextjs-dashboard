import type { JSX } from "react";
import { verifySessionOptimistic } from "@/server/auth/session";
import { fetchTotalCustomersCountDal } from "@/server/customers/dal";
import { getDB } from "@/server/db/connection";
import {
  readInvoicesSummary,
  readLatestInvoices,
} from "@/server/invoices/queries";
import { getValidUserRole } from "@/server/users/utils";
import type { AuthRole } from "@/shared/auth/roles";
import { DASHBOARD_TITLES } from "@/shared/constants/ui";
import { formatCurrency } from "@/shared/utils/general";
import { Dashboard } from "@/ui/dashboard/dashboard";
import { MiddlewareCard } from "@/ui/dashboard/middleware-card";

export const dynamic = "force-dynamic";

/**
 * Overview dashboard page with updated invoice integration.
 * Renders role-appropriate dashboard with new invoice schema compatibility.
 */
export default async function Page(): Promise<JSX.Element> {
  const db = getDB();

  const [session, invoicesSummary, latestInvoices, totalCustomers] =
    await Promise.all([
      verifySessionOptimistic(),
      readInvoicesSummary(db),
      readLatestInvoices(db, 5),
      fetchTotalCustomersCountDal(db),
    ]);

  const role: AuthRole = getValidUserRole(session?.role);

  const dashboardData = {
    cards: {
      totalCustomers,
      totalInvoices: invoicesSummary.totalInvoices,
      totalPaid: formatCurrency(invoicesSummary.totalPaid),
      totalPending: formatCurrency(invoicesSummary.totalPending),
    },
    latestInvoices,
  };

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
