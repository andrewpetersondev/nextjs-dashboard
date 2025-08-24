import type { JSX } from "react";
import { CustomerTableRow } from "@/features/customers/components/desktop-row";
import type { FormattedCustomersTableRow } from "@/features/customers/types";

/**
 * Table column definitions for customer data.
 */
const TABLE_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "totalInvoices", label: "Total Invoices" },
  { key: "totalPending", label: "Total Pending" },
  { key: "totalPaid", label: "Total Paid" },
] as const;

type ColumnKey = (typeof TABLE_COLUMNS)[number]["key"];

const HEADER_BASE_CLASS = "py-5 font-medium";

function getHeaderCellClass(key: ColumnKey): string {
  if (key === "name") {
    return `px-4 ${HEADER_BASE_CLASS} sm:pl-6`;
  }
  if (key === "totalPaid") {
    return `px-4 ${HEADER_BASE_CLASS}`;
  }
  return `px-3 ${HEADER_BASE_CLASS}`;
}

/**
 * Renders a responsive desktop table for customer data.
 * @param customers - Array of formatted customer table rows.
 * @returns JSX.Element
 */
export function DesktopTable({
  customers,
}: {
  customers: FormattedCustomersTableRow[];
}): JSX.Element {
  return (
    <table className="hidden min-w-full rounded-md text-text-primary md:table">
      <thead className="rounded-md bg-bg-accent text-left font-normal text-sm">
        <tr>
          {TABLE_COLUMNS.map(({ key, label }) => (
            <th className={getHeaderCellClass(key)} key={key} scope="col">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-bg-accent bg-bg-primary text-text-primary">
        {customers.map((customer) => (
          <CustomerTableRow customer={customer} key={customer.id} />
        ))}
      </tbody>
    </table>
  );
}
