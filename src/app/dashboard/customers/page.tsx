import type { Metadata } from "next";
import type { JSX } from "react";
import { fetchFilteredCustomers } from "@/src/lib/dal/customers.dal";
import { getDB } from "@/src/lib/db/connection";
import type { FormattedCustomersTableRow } from "@/src/lib/definitions/customers";
import { CustomersTable } from "@/src/ui/customers/table";

export const metadata: Metadata = {
	title: "Customers",
};

export const dynamic = "force-dynamic";

export interface CustomersSearchParams {
	query?: string;
	page?: string;
}

export interface CustomersPageProps {
	searchParams?: Promise<CustomersSearchParams>;
}

export default async function Page(
	props: CustomersPageProps,
): Promise<JSX.Element> {
	const db = getDB();
	const searchParams: CustomersSearchParams | undefined =
		await props.searchParams;

	const query: string = searchParams?.query || "";

	const customers: FormattedCustomersTableRow[] = await fetchFilteredCustomers(
		db,
		query,
	);

	return (
		<main>
			<CustomersTable customers={customers} />
		</main>
	);
}
