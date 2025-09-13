import Image from "next/image";
import type { JSX } from "react";
import type { FormattedCustomersTableRow } from "@/features/customers/types";
import { CUSTOMER_LABELS } from "@/shared/customers/types";
import { IMAGE_SIZES } from "@/shared/ui/tokens/images";

/**
 * Props for the CustomerMobileCard component.
 */
interface CustomerMobileCardProps {
  customer: FormattedCustomersTableRow;
}

/**
 * Renders a single customer card for mobile view.
 * @param customer - The customer data to display.
 */
export function CustomersTableMobileRow({
  customer,
}: CustomerMobileCardProps): JSX.Element {
  return (
    // Use role="region" and aria-label for accessibility on a non-interactive card
    <div
      className="mb-2 w-full rounded-md bg-bg-primary p-4"
      data-cy="customer-mobile-card"
      data-testid={`customer-mobile-card-${customer.id}`}
    >
      {/* Customer info: name, profile picture, and email */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="mb-2 flex items-center">
            <div className="flex items-center gap-3">
              <Image
                alt={`${customer.name}'s profile picture`}
                className="rounded-full"
                height={IMAGE_SIZES.SMALL}
                priority={true}
                src={customer.imageUrl}
                width={IMAGE_SIZES.SMALL}
              />
              <p className="font-medium">{customer.name}</p>
            </div>
          </div>
          <p className="text-sm text-text-primary">{customer.email}</p>
        </div>
      </div>

      {/* Customer financial details: pending and paid amounts */}
      <div className="flex w-full items-center justify-between border-b py-5">
        <div className="flex w-1/2 flex-col">
          <p className="text-xs">{CUSTOMER_LABELS.pending}</p>
          <p className="font-medium">{customer.totalPending}</p>
        </div>
        <div className="flex w-1/2 flex-col">
          <p className="text-xs">{CUSTOMER_LABELS.paid}</p>
          <p className="font-medium">{customer.totalPaid}</p>
        </div>
      </div>

      {/* Customer invoice total */}
      <div className="pt-4 text-sm">
        <p>
          {customer.totalInvoices} {CUSTOMER_LABELS.invoices}
        </p>
      </div>
    </div>
  );
}
