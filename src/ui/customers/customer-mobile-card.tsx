import Image from "next/image";
import type { JSX } from "react";
import type { FormattedCustomersTableRow } from "@/features/customers/customer.types";

/**
 * Label constants for customer card fields.
 */
const LABELS = {
  invoices: "invoices",
  paid: "Paid",
  pending: "Pending",
} as const;

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
export function CustomerMobileCard({
  customer,
}: CustomerMobileCardProps): JSX.Element {
  return (
    // Use role="region" and aria-label for accessibility on a non-interactive card
    <div
      className="mb-2 w-full rounded-md bg-bg-primary p-4"
      data-testid={`customer-mobile-card-${customer.id}`} // For Cypress/component testing
      key={customer.id}
    >
      {/* Customer info: name, profile picture, and email */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="mb-2 flex items-center">
            <div className="flex items-center gap-3">
              <Image
                alt={`${customer.name}'s profile picture`}
                className="rounded-full"
                height={28}
                priority
                src={customer.imageUrl}
                width={28}
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
          <p className="text-xs">{LABELS.pending}</p>
          <p className="font-medium">{customer.totalPending}</p>
        </div>
        <div className="flex w-1/2 flex-col">
          <p className="text-xs">{LABELS.paid}</p>
          <p className="font-medium">{customer.totalPaid}</p>
        </div>
      </div>

      {/* Customer invoice total */}
      <div className="pt-4 text-sm">
        <p>
          {customer.totalInvoices} {LABELS.invoices}
        </p>
      </div>
    </div>
  );
}
