import Image from "next/image";
import type { JSX } from "react";
import {
  DeleteInvoice,
  UpdateInvoice,
} from "@/features/invoices/components/buttons";
import { InvoiceStatusComponent } from "@/features/invoices/components/status";
import { formatDateLocalized } from "@/features/invoices/lib/date.utils";
import type { InvoiceListFilter } from "@/features/invoices/lib/types";
import { formatCurrency } from "@/shared/utilities/money/convert";

/**
 * MobileTable component displays invoices in a mobile-friendly format.
 * It shows each invoice as a card with customer details, amount, date, and action buttons.
 * This component is only visible on mobile devices (hidden on md breakpoint and above).
 *
 * @param {Object} props - Component props
 * @param {InvoiceListFilter[]} props.invoices - Array of invoice data to display
 * @returns {JSX.Element} Mobile-friendly table component
 */
export const MobileTable = ({
  invoices,
}: {
  invoices: InvoiceListFilter[];
}): JSX.Element => {
  return (
    <div className="md:hidden">
      {/* Map through invoices and create mobile-friendly cards */}
      {invoices?.map(
        (invoice): JSX.Element => (
          <div
            className="mb-2 w-full rounded-md bg-bg-primary p-4"
            data-cy="invoice-row"
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
              <InvoiceStatusComponent status={invoice.status} />
            </div>
            {/* Amount, date and actions section */}
            <div className="flex w-full items-center justify-between pt-4">
              <div>
                <p className="font-medium text-xl">
                  {formatCurrency(invoice.amount)}
                </p>
                <p>{formatDateLocalized(invoice.date.toISOString())}</p>
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
