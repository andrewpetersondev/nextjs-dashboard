import {
  BanknotesIcon,
  ClockIcon,
  InboxIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import type { JSX } from "react";
import type { DashboardCardData } from "@/shared/ui/types";
import { H3 } from "@/ui/primitives/headings";

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
      <Card title="Collected" type="collected" value={data.totalPaid} />
      <Card title="Pending" type="pending" value={data.totalPending} />
      {/*  todo: property is missing from CardWrapperProps */}
      <Card title="Total Invoices" type="invoices" value={data.totalInvoices} />
      <Card
        title="Total Customers"
        type="customers"
        value={data.totalCustomers}
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: "invoices" | "customers" | "pending" | "collected";
}): JSX.Element {
  const Icon = ICON_MAP[type];

  return (
    <div className="rounded-xl bg-bg-secondary p-2 text-text-secondary shadow-xs">
      <div className="flex p-4">
        <Icon className="h-5 w-5 text-text-primary" />
        <H3 className="ml-2">{title}</H3>
      </div>
      <p className="truncate rounded-xl px-4 py-8 text-center text-2xl">
        {value}
      </p>
    </div>
  );
}
