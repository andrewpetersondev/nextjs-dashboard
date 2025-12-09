import type { JSX } from "react";
import { TableRowSkeleton } from "@/ui/feedback/skeleton/skeletons";
import { shimmer } from "@/ui/feedback/skeleton/skeletons.constants";

export function InvoiceSkeleton(): JSX.Element {
  return (
    <div className="flex flex-row items-center justify-between border-bg-accent border-b py-4">
      <div className="flex items-center">
        <div className="mr-2 h-8 w-8 rounded-full bg-bg-accent" />
        <div className="min-w-0">
          <div className="h-5 w-40 rounded-md bg-bg-accent" />
          <div className="mt-2 h-4 w-12 rounded-md bg-bg-accent" />
        </div>
      </div>
      <div className="mt-2 h-4 w-12 rounded-md bg-bg-accent" />
    </div>
  );
}

export function LatestInvoicesSkeleton(): JSX.Element {
  return (
    <div
      className={`${shimmer} relative flex w-full flex-col overflow-hidden md:col-span-4`}
    >
      <div className="mb-4 h-8 w-36 rounded-md bg-bg-accent" />
      <div className="flex grow flex-col justify-between rounded-xl bg-bg-accent p-4">
        <div className="bg-bg-primary px-6">
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
        </div>
        <div className="flex items-center pt-6 pb-2">
          <div className="h-5 w-5 rounded-full bg-bg-accent" />
          <div className="ml-2 h-4 w-20 rounded-md bg-bg-accent" />
        </div>
      </div>
    </div>
  );
}

export function InvoicesMobileSkeleton(): JSX.Element {
  return (
    <div className="mb-2 w-full rounded-md bg-bg-accent p-4">
      <div className="flex items-center justify-between border-bg-primary border-b pb-8">
        <div className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-bg-accent" />
          <div className="h-6 w-16 rounded-sm bg-bg-accent" />
        </div>
        <div className="h-6 w-16 rounded-sm bg-bg-accent" />
      </div>
      <div className="flex w-full items-center justify-between pt-4">
        <div>
          <div className="h-6 w-16 rounded-sm bg-bg-accent" />
          <div className="mt-2 h-6 w-24 rounded-sm bg-bg-primary" />
        </div>
        <div className="flex justify-end gap-2">
          <div className="h-10 w-10 rounded-sm bg-bg-accent" />
          <div className="h-10 w-10 rounded-sm bg-bg-accent" />
        </div>
      </div>
    </div>
  );
}

export function InvoicesTableSkeleton(): JSX.Element {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-bg-accent p-2 md:pt-0">
          <div className="md:hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <skeletons are static>
              <InvoicesMobileSkeleton key={i} />
            ))}
          </div>
          <table className="hidden min-w-full text-text-primary md:table">
            <thead className="rounded-lg text-left font-normal text-sm">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6" scope="col">
                  Customer
                </th>
                <th className="px-3 py-5 font-medium" scope="col">
                  Email
                </th>
                <th className="px-3 py-5 font-medium" scope="col">
                  Amount
                </th>
                <th className="px-3 py-5 font-medium" scope="col">
                  Date
                </th>
                <th className="px-3 py-5 font-medium" scope="col">
                  Status
                </th>
                <th
                  className="relative pt-2 pr-6 pb-4 pl-3 sm:pr-6"
                  scope="col"
                >
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-bg-accent">
              {Array.from({ length: 6 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <skeletons are static>
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function InvoicesSearchSkeleton(): JSX.Element {
  return <div>Invoices Search Skeleton</div>;
}
