import { CheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export default function InvoiceStatus({
  paymentStatus,
}: {
  paymentStatus: string | null;
}) {
  if (!paymentStatus) {
    return null; // Safely render nothing if paymentStatus is null
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-1 text-xs",
        {
          "bg-gray-100 text-gray-500": paymentStatus === "pending",
          "bg-green-500 text-white": paymentStatus === "paid",
        },
      )}
    >
      {paymentStatus === "pending" ? (
        <>
          Pending
          <ClockIcon className="ml-1 w-4 text-gray-500" />
        </>
      ) : null}
      {paymentStatus === "paid" ? (
        <>
          Paid
          <CheckIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
    </span>
  );
}