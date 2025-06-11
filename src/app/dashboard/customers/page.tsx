import { fetchFilteredCustomers } from "@/src/lib/data";
import type { FormattedCustomersTableRow } from "@/src/lib/definitions/customers";
import CustomersTable from "@/src/ui/customers/table";
import type { Metadata } from "next";
import type { JSX } from "react";

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
	const searchParams: CustomersSearchParams | undefined =
		await props.searchParams;

	const query: string = searchParams?.query || "";

	const customers: FormattedCustomersTableRow[] =
		await fetchFilteredCustomers(query);

	return (
		<main>
			<CustomersTable customers={customers} />
		</main>
	);
}
