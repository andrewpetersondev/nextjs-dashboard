import Image from "next/image";
import type { JSX } from "react";
import type { FetchFilteredInvoicesData } from "@/lib/definitions/invoices.types";
import { formatCurrency, formatDateToLocal } from "@/lib/utils/utils";
import { DeleteInvoice, UpdateInvoice } from "@/ui/invoices/buttons";
import { InvoiceStatusComponent } from "@/ui/invoices/status";

/**
 * MobileTable component displays invoices in a mobile-friendly format.
 * It shows each invoice as a card with customer details, amount, date, and action buttons.
 * This component is only visible on mobile devices (hidden on md breakpoint and above).
 *
 * @param {Object} props - Component props
 * @param {FetchFilteredInvoicesData[]} props.invoices - Array of invoice data to display
 * @returns {JSX.Element} Mobile-friendly table component
 */

export const MobileTable = ({
  invoices,
}: {
  invoices: FetchFilteredInvoicesData[];
}): JSX.Element => {
  return (
    <div className="md:hidden">
      {/* Map through invoices and create mobile-friendly cards */}
      {invoices?.map(
        (invoice: FetchFilteredInvoicesData): JSX.Element => (
          <div
            className="mb-2 w-full rounded-md bg-bg-primary p-4"
            key={invoice.id}
          >
            {/* Customer information and status section */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="mb-2 flex items-center">
                  <Image
                    alt={`${invoice.name}'s profile picture`}
                    className="mr-2 rounded-full"
                    height={28}
                    src={invoice.imageUrl}
                    width={28}
                  />
                  <p>{invoice.name}</p>
                </div>
                <p className="text-sm text-text-primary">{invoice.email}</p>
              </div>
              <InvoiceStatusComponent status={invoice.status || "unknown"} />
            </div>
            {/* Amount, date and actions section */}
            <div className="flex w-full items-center justify-between pt-4">
              <div>
                <p className="font-medium text-xl">
                  {formatCurrency(invoice.amount)}
                </p>
                <p>{formatDateToLocal(invoice.date)}</p>
              </div>
              <div className="flex justify-end gap-2">
                <UpdateInvoice id={invoice.id} />
                <DeleteInvoice id={invoice.id} />
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
};
