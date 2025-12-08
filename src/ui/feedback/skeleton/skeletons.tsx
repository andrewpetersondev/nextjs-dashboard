import type { JSX } from "react";
import { shimmer } from "@/ui/feedback/skeleton/skeletons.constants";

export function CardSkeleton(): JSX.Element {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-bg-accent p-2 shadow-xs`}
    >
      <div className="flex p-4">
        <div className="h-5 w-5 rounded-md bg-bg-primary" />
        <div className="ml-2 h-6 w-16 rounded-md bg-bg-primary font-medium text-sm" />
      </div>
      <div className="flex items-center justify-center truncate rounded-xl bg-bg-primary px-4 py-8">
        <div className="h-7 w-20 rounded-md bg-bg-accent" />
      </div>
    </div>
  );
}

export function CardsSkeleton(): JSX.Element {
  return (
    <>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
}

export function TableRowSkeleton(): JSX.Element {
  return (
    <tr className="w-full border-bg-primary border-b last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
      {/* Customer Name and Image */}
      <td className="relative overflow-hidden whitespace-nowrap py-3 pr-3 pl-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-bg-accent" />
          <div className="h-6 w-24 rounded-sm bg-bg-accent" />
        </div>
      </td>
      {/* Email */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-32 rounded-sm bg-bg-accent" />
      </td>
      {/* Amount */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded-sm bg-bg-accent" />
      </td>
      {/* Date */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded-sm bg-bg-accent" />
      </td>
      {/* InvoiceStatusComponent */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded-sm bg-bg-accent" />
      </td>
      {/* Actions */}
      <td className="whitespace-nowrap py-3 pr-3 pl-6">
        <div className="flex justify-end gap-3">
          <div className="h-[38px] w-[38px] rounded-sm bg-bg-accent" />
          <div className="h-[38px] w-[38px] rounded-sm bg-bg-accent" />
        </div>
      </td>
    </tr>
  );
}
