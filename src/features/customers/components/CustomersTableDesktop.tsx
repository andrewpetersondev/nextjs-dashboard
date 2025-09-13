import type { JSX } from "react";
import { CustomersTableDesktopRow } from "@/features/customers/components/CustomersTableDesktopRow";
import { CUSTOMER_TABLE_HEADERS } from "@/features/customers/constants";
import type { FormattedCustomersTableRow } from "@/features/customers/types";

/**
 * Table column definitions for customer data.
 */
const TABLE_COLUMNS = [
  { key: "name", label: CUSTOMER_TABLE_HEADERS.name },
  { key: "email", label: CUSTOMER_TABLE_HEADERS.email },
  { key: "totalInvoices", label: CUSTOMER_TABLE_HEADERS.totalInvoices },
  { key: "totalPending", label: CUSTOMER_TABLE_HEADERS.totalPending },
  { key: "totalPaid", label: CUSTOMER_TABLE_HEADERS.totalPaid },
] as const;

type ColumnKey = (typeof TABLE_COLUMNS)[number]["key"];

const HEADER_BASE_CLASS = "py-5 font-medium";

const HEADER_PADDING_MAP: Record<ColumnKey, string> = {
  email: "px-3",
  name: "px-4 sm:pl-6",
  totalInvoices: "px-3",
  totalPaid: "px-4",
  totalPending: "px-3",
};

function getHeaderCellClass(key: ColumnKey): string {
  return `${HEADER_PADDING_MAP[key]} ${HEADER_BASE_CLASS}`;
}

/**
 * Renders a responsive desktop table for customer data.
 * @param customers - Array of formatted customer table rows.
 * @returns JSX.Element
 */
export function CustomersTableDesktop({
  customers,
}: {
  customers: FormattedCustomersTableRow[];
}): JSX.Element {
  return (
    <table
      className="hidden min-w-full rounded-md text-text-primary md:table"
      data-cy="customers-table"
    >
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
          <CustomersTableDesktopRow customer={customer} key={customer.id} />
        ))}
      </tbody>
    </table>
  );
}
