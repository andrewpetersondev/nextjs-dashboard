import type { JSX } from "react";
import { verifySessionOptimistic } from "@/modules/auth/presentation/session/actions/verify-session-optimistic.action";
import { readTotalCustomersCountAction } from "@/modules/customers/infrastructure/actions/read-total-customers-count.action";
import { ITEMS_PER_PAGE_INVOICES } from "@/modules/invoices/domain/invoice.constants";
import { readInvoicesSummaryAction } from "@/modules/invoices/infrastructure/actions/read-invoices-summary.action";
import { readLatestInvoicesAction } from "@/modules/invoices/infrastructure/actions/read-latest-invoices.action";
import { getAppDb } from "@/server/db/db.connection";
import { formatCurrency } from "@/shared/utilities/money/convert";
import { normalizeUserRole } from "@/shared/validation/user/user-role.parser";
import {
  ADMIN_ROLE,
  GUEST_ROLE,
  USER_ROLE,
  type UserRole,
} from "@/shared/validation/user/user-role.schema";
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
