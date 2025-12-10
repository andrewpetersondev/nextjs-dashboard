import {
  BanknotesIcon,
  ClockIcon,
  InboxIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import type { JSX } from "react";
import type { DashboardCardData } from "@/shell/dashboard/types";
import { StatCardAtom } from "@/ui/atoms/stat-card.atom";

/**
 * Card types for dashboard.
 */
type CardType = "invoices" | "customers" | "pending" | "collected";

/**
 * Icon mapping for card types.
 */
const ICON_MAP: Record<CardType, React.ComponentType<{ className: string }>> = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  invoices: InboxIcon,
  pending: ClockIcon,
};

interface CardWrapperProps {
  /** Data for dashboard cards. */
  data: DashboardCardData;
}

export function CardWrapper({ data }: CardWrapperProps): JSX.Element {
  return (
    <>
      <StatCardAtom
        icon={ICON_MAP.collected}
        title="Collected"
        value={data.totalPaid}
      />
      <StatCardAtom
        icon={ICON_MAP.pending}
        title="Pending"
        value={data.totalPending}
      />
      <StatCardAtom
        icon={ICON_MAP.invoices}
        title="Total Invoices"
        value={data.totalInvoices}
      />
      <StatCardAtom
        icon={ICON_MAP.customers}
        title="Total Customers"
        value={data.totalCustomers}
      />
    </>
  );
}
