import { ArrowPathIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Image from "next/image";
import type { JSX } from "react";
import { IMAGE_SIZES } from "@/shared/constants/ui";
import type { InvoiceListFilter } from "@/shared/types/invoices";
import { formatCurrency } from "@/shared/utils/general";
import { H2, H3 } from "@/ui/headings";

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
    <div className="flex w-full flex-col md:col-span-4">
      <H2 className="mb-4">Latest Invoices</H2>
      <div className="flex grow flex-col justify-between rounded-xl bg-bg-secondary p-4">
        <div className="bg-bg-primary px-6">
          {latestInvoices.map((invoice, i: number): JSX.Element => {
            return (
              <div
                className={clsx(
                  "flex flex-row items-center justify-between py-4",
                  {
                    "border-text-secondary border-t": i !== 0,
                  },
                )}
                key={invoice.id}
              >
                <div className="flex items-center">
                  <Image
                    alt={`${invoice.name}'s profile picture`}
                    className="mr-4 rounded-full"
                    height={IMAGE_SIZES.SMALL}
                    src={invoice.imageUrl}
                    width={IMAGE_SIZES.SMALL}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-sm text-text-secondary md:text-base">
                      {invoice.name}
                    </p>
                    <p className="hidden text-sm text-text-secondary sm:block">
                      {invoice.email}
                    </p>
                  </div>
                </div>
                <p className="truncate font-medium text-sm text-text-secondary md:text-base">
                  {formatCurrency(invoice.amount)}
                </p>
              </div>
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
