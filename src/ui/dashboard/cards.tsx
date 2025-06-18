import {
	BanknotesIcon,
	ClockIcon,
	InboxIcon,
	UserGroupIcon,
} from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { getDB } from "@/src/db/connection";
import { fetchCardData } from "@/src/lib/dal/data.dal";
import { H3 } from "@/src/ui/headings";

const iconMap = {
	collected: BanknotesIcon,
	customers: UserGroupIcon,
	invoices: InboxIcon,
	pending: ClockIcon,
};

export async function CardWrapper(): Promise<JSX.Element> {
	const db = getDB();
	const { invoiceCount, pendingInvoices, paidInvoices, customerCount } =
		await fetchCardData(db);
	return (
		<>
			<Card title="Collected" type="collected" value={paidInvoices} />
			<Card title="Pending" type="pending" value={pendingInvoices} />
			<Card title="Total Invoices" type="invoices" value={invoiceCount} />
			<Card title="Total Customers" type="customers" value={customerCount} />
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
