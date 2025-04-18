import {
  BanknotesIcon,
  ClockIcon,
  InboxIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { lusitana } from "@/src/ui/fonts";
import { fetchCardData } from "@/src/lib/data";

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export async function CardWrapper() {
  const { invoiceCount, pendingInvoices, paidInvoices, customerCount } =
    await fetchCardData();
  return (
    <>
      <Card title="Collected" value={paidInvoices} type="collected" />
      <Card title="Pending" value={pendingInvoices} type="pending" />
      <Card title="Total Invoices" value={invoiceCount} type="invoices" />
      <Card title="Total Customers" value={customerCount} type="customers" />
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
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-bg-accent p-2 shadow-xs">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-text-primary" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-bg-primary px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}