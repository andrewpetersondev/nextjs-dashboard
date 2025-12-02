import Image from "next/image";
import type { JSX } from "react";
import type { FormattedCustomersTableRow } from "@/features/customers/types";
import { IMAGE_SIZES } from "@/shared/presentation/ui/images.tokens";

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
export function CustomersTableDesktopRow({
  customer,
}: CustomerTableRowProps): JSX.Element {
  return (
    <tr
      className="group cursor-pointer hover:bg-bg-active"
      data-cy="customer-row"
    >
      <td className="whitespace-nowrap py-5 pr-3 pl-4 text-sm text-text-primary group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
        <div className="flex items-center gap-3">
          <Image
            alt={`${customer.name}'s profile picture`}
            className="rounded-full"
            height={IMAGE_SIZES.small}
            priority={false}
            src={customer.imageUrl}
            width={IMAGE_SIZES.small}
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
