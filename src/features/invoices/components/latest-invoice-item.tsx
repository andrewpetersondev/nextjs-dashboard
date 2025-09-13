import clsx from "clsx";
import Image from "next/image";
import type { JSX } from "react";
import type { InvoiceListFilter } from "@/features/invoices/dto/types";
import { formatCurrency } from "@/shared/money/convert";
import { IMAGE_SIZES } from "@/shared/ui/tokens/images";

export interface LatestInvoiceItemProps {
  readonly invoice: InvoiceListFilter;
  readonly hasTopBorder: boolean;
}

export function LatestInvoiceItem({
  invoice,
  hasTopBorder,
}: LatestInvoiceItemProps): JSX.Element {
  return (
    <div
      className={clsx("flex flex-row items-center justify-between py-4", {
        "border-text-secondary border-t": hasTopBorder,
      })}
      data-cy="latest-invoices-item"
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
}
