import { CheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import type { JSX } from "react";
import type { InvoiceStatus } from "@/src/lib/definitions/enums";

export function InvoiceStatusComponent({
	status,
}: {
	status: InvoiceStatus;
}): JSX.Element {
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
					<ClockIcon className="text-text-accent ml-1 w-4" />
				</>
			)}
			{status === "paid" && (
				<>
					Paid
					<CheckIcon className="text-text-primary ml-1 w-4" />
				</>
			)}
		</span>
	);
}
