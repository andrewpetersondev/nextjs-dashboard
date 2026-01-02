import type { JSX } from "react";
import { verifySessionOptimistic } from "@/modules/auth/infrastructure/actions/verify-session-optimistic.action";
import { readTotalCustomersCountAction } from "@/modules/customers/server/application/actions/read-total-customers-count.action";
import { ITEMS_PER_PAGE_INVOICES } from "@/modules/invoices/domain/invoice.constants";
import { readInvoicesSummaryAction } from "@/modules/invoices/server/application/actions/read-invoices-summary.action";
import { readLatestInvoicesAction } from "@/modules/invoices/server/application/actions/read-latest-invoices.action";
import { getAppDb } from "@/server/db/db.connection";
import { normalizeUserRole } from "@/shared/domain/user/user-role.parser";
import {
  ADMIN_ROLE,
  GUEST_ROLE,
  USER_ROLE,
  type UserRole,
} from "@/shared/domain/user/user-role.types";
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
      readInvoicesSummaryAction(db),
      readLatestInvoicesAction(db, ITEMS_PER_PAGE_INVOICES),
      readTotalCustomersCountAction(),
    ]);

  const role: UserRole = normalizeUserRole(session?.role);

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
