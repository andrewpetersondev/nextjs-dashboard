import type { PaymentStatus } from "@/src/lib/definitions/invoices";
import { CheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export default function InvoiceStatus({
	paymentStatus,
}: {
	paymentStatus: PaymentStatus;
}) {
	return (
		<span
			className={clsx(
				"inline-flex items-center rounded-full px-2 py-1 text-xs",
				{
					"bg-bg-accent text-text-primary": paymentStatus === "pending",
					"bg-bg-secondary text-text-secondary": paymentStatus === "paid",
				},
			)}
		>
			{paymentStatus === "pending" && (
				<>
					Pending
					<ClockIcon className="text-text-accent ml-1 w-4" />
				</>
			)}
			{paymentStatus === "paid" && (
				<>
					Paid
					<CheckIcon className="text-text-primary ml-1 w-4" />
				</>
			)}
		</span>
	);
}
