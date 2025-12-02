import type { JSX } from "react";
import {
  ADMIN_ROLE,
  GUEST_ROLE,
  USER_ROLE,
  type UserRole,
} from "@/features/auth/lib/auth.roles";
import { ITEMS_PER_PAGE_INVOICES } from "@/features/invoices/lib/constants";
import { getValidUserRole } from "@/features/users/lib/get-valid-user-role";
import { verifySessionOptimistic } from "@/server/auth/application/actions/verify-session-optimistic.action";
import { readTotalCustomersCountAction } from "@/server/customers/actions/read-total-count";
import { getAppDb } from "@/server/db/db.connection";
import {
  readInvoicesSummary,
  readLatestInvoices,
} from "@/server/invoices/queries";
import { formatCurrency } from "@/shared/utilities/money/convert";
import { Dashboard } from "@/shell/dashboard/components/dashboard";
import { MiddlewareCard } from "@/shell/dashboard/components/middleware-card";
import { DASHBOARD_TITLES } from "@/shell/dashboard/constants";

// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const dynamic = "force-dynamic";

/**
 * Overview dashboard page with updated invoice integration.
 * Renders role-appropriate dashboard with new invoice schema compatibility.
 */
export default async function Page(): Promise<JSX.Element> {
  const db = getAppDb();

  const [session, invoicesSummary, latestInvoices, totalCustomers] =
    await Promise.all([
      verifySessionOptimistic(),
      readInvoicesSummary(db),
      readLatestInvoices(db, ITEMS_PER_PAGE_INVOICES),
      readTotalCustomersCountAction(),
    ]);

  const role: UserRole = getValidUserRole(session?.role);

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
  if (role === ADMIN_ROLE) {
    title = DASHBOARD_TITLES.admin;
  } else if (role === USER_ROLE) {
    title = DASHBOARD_TITLES.user;
  } else if (role === GUEST_ROLE) {
    title = DASHBOARD_TITLES.guest;
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

  // getValidUserRole already enforces allowed roles; this condition will always be true.
  return commonContent;
}
