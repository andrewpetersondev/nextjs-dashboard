import {
	CheckIcon,
	ClockIcon,
	ExclamationCircleIcon,
	NoSymbolIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import type { ComponentType, JSX, SVGProps } from "react";
import type { InvoiceDisplayStatus } from "@/modules/invoices/domain/statuses/invoice-status.display";

type StatusPresentation = Readonly<{
	badgeClassName: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	iconClassName: string;
	label: string;
}>;

// Record over InvoiceDisplayStatus keeps this exhaustive: a new status fails
// typecheck here instead of rendering an empty badge.
const STATUS_PRESENTATION: Record<InvoiceDisplayStatus, StatusPresentation> = {
	overdue: {
		// Error tokens, not accent: red-on-sky fails WCAG AA in dark, and the
		// error pair reads as the warning it is.
		badgeClassName: "bg-bg-error text-text-error",
		icon: ExclamationCircleIcon,
		iconClassName: "text-text-error",
		label: "Overdue",
	},
	paid: {
		badgeClassName: "bg-bg-secondary text-text-secondary",
		icon: CheckIcon,
		iconClassName: "text-text-primary",
		label: "Paid",
	},
	pending: {
		badgeClassName: "bg-bg-accent text-text-primary",
		icon: ClockIcon,
		iconClassName: "text-text-accent",
		label: "Pending",
	},
	void: {
		// The disabled-bg token is the "inert" signal; text-disabled on a chip
		// fails WCAG AA contrast in both schemes, so the text stays primary.
		badgeClassName: "bg-bg-disabled text-text-primary",
		icon: NoSymbolIcon,
		iconClassName: "text-text-primary",
		label: "Void",
	},
};

export const InvoiceStatusComponent = ({
	status,
}: {
	status: InvoiceDisplayStatus;
}): JSX.Element => {
	const presentation = STATUS_PRESENTATION[status];
	const Icon = presentation.icon;

	return (
		<span
			className={clsx(
				"inline-flex items-center rounded-full px-2 py-1 text-xs",
				presentation.badgeClassName,
			)}
			data-cy="invoice-status-badge"
			data-status={status}
		>
			{presentation.label}
			<Icon className={clsx("ml-1 w-4", presentation.iconClassName)} />
		</span>
	);
};
