import type { JSX } from "react";
import { Dashboard } from "@/features/dashboard/components/dashboard";
import { MiddlewareCard } from "@/features/dashboard/components/middleware-card";
import { DASHBOARD_TITLES } from "@/features/dashboard/constants";
import { ITEMS_PER_PAGE_INVOICES } from "@/features/invoices/constants";
import { verifySessionOptimistic } from "@/server/auth/session";
import { readTotalCustomersCountAction } from "@/server/customers/actions/read-total-count";
import { getDB } from "@/server/db/connection";
import {
  readInvoicesSummary,
  readLatestInvoices,
} from "@/server/invoices/queries";
import { getValidUserRole } from "@/server/users/utils";
import { AUTH_ROLES, type AuthRole, ROLES } from "@/shared/auth/domain/roles";
import { formatCurrency } from "@/shared/money/convert";

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
  if (role === ROLES.ADMIN) {
    title = DASHBOARD_TITLES.ADMIN;
  } else if (role === ROLES.USER) {
    title = DASHBOARD_TITLES.USER;
  } else if (role === ROLES.GUEST) {
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

  if (AUTH_ROLES.includes(role)) {
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
