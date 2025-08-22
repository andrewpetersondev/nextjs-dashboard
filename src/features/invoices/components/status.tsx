import { CheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import type { JSX } from "react";

import type { InvoiceStatus } from "@/features/invoices/types";

export const InvoiceStatusComponent = ({
  status,
}: {
  status: InvoiceStatus;
}): JSX.Element => {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-1 text-xs",
        {
          "bg-bg-accent text-text-primary": status === "pending",
          "bg-bg-secondary text-text-secondary": status === "paid",
        },
      )}
    >
      {status === "pending" && (
        <>
          Pending
          <ClockIcon className="ml-1 w-4 text-text-accent" />
        </>
      )}
      {status === "paid" && (
        <>
          Paid
          <CheckIcon className="ml-1 w-4 text-text-primary" />
        </>
      )}
    </span>
  );
};
