import Image from "next/image";
import type { JSX } from "react";
import type { FormattedCustomersTableRow } from "@/features/customers/customer.types";

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

/**
 * Props for the CustomerTableRow component.
 */
interface CustomerTableRowProps {
  customer: FormattedCustomersTableRow;
}

/**
 * Renders a single customer row for the desktop table.
 * @param customer - The customer data to display.
 */
function CustomerTableRow({ customer }: CustomerTableRowProps): JSX.Element {
  return (
    <tr className="group cursor-pointer hover:bg-bg-active" key={customer.id}>
      <td className="whitespace-nowrap py-5 pr-3 pl-4 text-sm text-text-primary group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
        <div className="flex items-center gap-3">
          <Image
            alt={`${customer.name}'s profile picture`}
            className="rounded-full"
            height={28}
            priority
            src={customer.imageUrl}
            width={28}
          />
          <p>{customer.name}</p>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-5 text-sm">{customer.email}</td>
      <td className="whitespace-nowrap px-4 py-5 text-sm">
        {customer.totalInvoices}
      </td>
      <td className="whitespace-nowrap px-4 py-5 text-sm">
        {customer.totalPending}
      </td>
      <td className="whitespace-nowrap px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
        {customer.totalPaid}
      </td>
    </tr>
  );
}

/**
 * Renders a responsive desktop table for customer data.
 * @param customers - Array of formatted customer table rows.
 * @returns JSX.Element
 */
export async function DesktopTable({
  customers,
}: {
  customers: FormattedCustomersTableRow[];
}): Promise<JSX.Element> {
  return (
    <table className="hidden min-w-full rounded-md text-text-primary md:table">
      <thead className="rounded-md bg-bg-accent text-left font-normal text-sm">
        <tr>
          {TABLE_COLUMNS.map(({ key, label }) => (
            <th
              className={
                key === "name"
                  ? "px-4 py-5 font-medium sm:pl-6"
                  : key === "totalPaid"
                    ? "px-4 py-5 font-medium"
                    : "px-3 py-5 font-medium"
              }
              key={key}
              scope="col"
            >
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
