import type { JSX } from "react";
import { verifySessionOptimistic } from "@/server/auth/session";
import { readTotalCustomersCountAction } from "@/server/customers/actions/actions";
import { getDB } from "@/server/db/connection";
import {
  readInvoicesSummary,
  readLatestInvoices,
} from "@/server/invoices/queries";
import { getValidUserRole } from "@/server/users/utils";
import type { AuthRole } from "@/shared/auth/roles";
import {
  DASHBOARD_TITLES,
  ITEMS_PER_PAGE_INVOICES,
} from "@/shared/constants/ui";
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
      readLatestInvoices(db, ITEMS_PER_PAGE_INVOICES),
      readTotalCustomersCountAction(),
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

  let title = "Dashboard";
  if (role === "admin") {
    title = DASHBOARD_TITLES.ADMIN;
  } else if (role === "user") {
    title = DASHBOARD_TITLES.USER;
  } else if (role === "guest") {
    title = DASHBOARD_TITLES.GUEST;
  }

  const commonContent = (
    <main>
      <MiddlewareCard />
      <Dashboard
        dashboardCardData={dashboardData.cards}
        latestInvoices={dashboardData.latestInvoices}
        title={title}
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
