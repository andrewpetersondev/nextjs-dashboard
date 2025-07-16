import { ArrowPathIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Image from "next/image";
import type { JSX } from "react";
import { readLatestInvoicesAction } from "@/features/invoices/invoice.actions";
import { H2, H3 } from "@/ui/headings";

/**
 * LatestInvoices component.
 * Fetches the latest invoices using a server action and renders the list.
 */
export async function LatestInvoices(): Promise<JSX.Element> {
  // Fetch data via server action for decoupling and testability
  const latestInvoices = await readLatestInvoicesAction();
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
                    height={32}
                    src={invoice.imageUrl || "/default-avatar.png"}
                    width={32}
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
                  {invoice.amount}
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
