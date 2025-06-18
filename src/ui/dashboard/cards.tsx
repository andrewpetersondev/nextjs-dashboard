import { getDB } from "@/src/db/connection";
import { fetchCardData } from "@/src/lib/dal/data.dal";
import { H3 } from "@/src/ui/headings";
import {
	BanknotesIcon,
	ClockIcon,
	InboxIcon,
	UserGroupIcon,
} from "@heroicons/react/24/outline";
import type { JSX } from "react";

const iconMap = {
	collected: BanknotesIcon,
	customers: UserGroupIcon,
	pending: ClockIcon,
	invoices: InboxIcon,
};

export async function CardWrapper(): Promise<JSX.Element> {
	const db = getDB();
	const { invoiceCount, pendingInvoices, paidInvoices, customerCount } =
		await fetchCardData(db);
	return (
		<>
			<Card title="Collected" value={paidInvoices} type="collected" />
			<Card title="Pending" value={pendingInvoices} type="pending" />
			<Card title="Total Invoices" value={invoiceCount} type="invoices" />
			<Card title="Total Customers" value={customerCount} type="customers" />
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
	const Icon = iconMap[type];

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
