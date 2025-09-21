import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { LatestInvoiceItem } from "@/features/invoices/components/latest-invoice-item";
import type { InvoiceListFilter } from "@/features/invoices/lib/types";
import { H2, H3 } from "@/ui/atoms/typography/headings";

interface LatestInvoicesProps {
  readonly latestInvoices: readonly InvoiceListFilter[];
}

/**
 * Latest invoices component with updated invoice schema support.
 * Displays recent invoices with customer information and formatted amounts.
 */
export function LatestInvoices({
  latestInvoices,
}: LatestInvoicesProps): JSX.Element {
  return (
    <div
      className="flex w-full flex-col md:col-span-4"
      data-cy="latest-invoices"
    >
      <H2 className="mb-4">Latest Invoices</H2>
      <div className="flex grow flex-col justify-between rounded-xl bg-bg-secondary p-4">
        <div className="bg-bg-primary px-6">
          {latestInvoices.map((invoice, i: number): JSX.Element => {
            return (
              <LatestInvoiceItem
                hasTopBorder={i !== 0}
                invoice={invoice}
                key={invoice.id}
              />
            );
          })}
        </div>
        <div className="flex items-center pt-6 pb-2 text-text-primary">
          <ArrowPathIcon className="h-5 w-5" />
          <H3 className="ml-2">Updated just now</H3>
        </div>
      </div>
    </div>
  );
}
