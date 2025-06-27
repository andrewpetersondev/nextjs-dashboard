import {
	BanknotesIcon,
	ClockIcon,
	InboxIcon,
	UserGroupIcon,
} from "@heroicons/react/24/outline";
import type { JSX } from "react";
import type { CardData } from "@/src/lib/dal/data.dal.ts";
import { H3 } from "@/src/ui/headings.tsx";

/**
 * Card types for dashboard.
 */
export type CardType = "invoices" | "customers" | "pending" | "collected";

/**
 * Icon mapping for card types.
 */
const ICON_MAP: Record<CardType, React.ComponentType<{ className: string }>> = {
	collected: BanknotesIcon,
	customers: UserGroupIcon,
	invoices: InboxIcon,
	pending: ClockIcon,
};

export interface CardWrapperProps {
	/** Data for dashboard cards. */
	data: CardData;
}

export async function CardWrapper({
	data,
}: CardWrapperProps): Promise<JSX.Element> {
	return (
		<>
			<Card title="Collected" type="collected" value={data.paidInvoices} />
			<Card title="Pending" type="pending" value={data.pendingInvoices} />
			<Card title="Total Invoices" type="invoices" value={data.invoiceCount} />
			<Card
				title="Total Customers"
				type="customers"
				value={data.customerCount}
			/>
		</>
	);
}

export function Card({
	title,
	value,
	type,
}: {
	title: string;
	value: number | string;
	type: "invoices" | "customers" | "pending" | "collected";
}): JSX.Element {
	const Icon = ICON_MAP[type];

	return (
		<div className="bg-bg-secondary text-text-secondary rounded-xl p-2 shadow-xs">
			<div className="flex p-4">
				<Icon className="text-text-primary h-5 w-5" />
				<H3 className="ml-2">{title}</H3>
			</div>
			<p className="truncate rounded-xl px-4 py-8 text-center text-2xl">
				{value}
			</p>
		</div>
	);
}
