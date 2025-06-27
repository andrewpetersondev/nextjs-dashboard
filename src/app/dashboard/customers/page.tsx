import type { Metadata } from "next";
import type { JSX } from "react";
import { fetchFilteredCustomers } from "@/src/lib/dal/customers.dal.ts";
import { getDB } from "@/src/lib/db/connection.ts";
import type { FormattedCustomersTableRow } from "@/src/lib/definitions/customers.ts";
import { CustomersTable } from "@/src/ui/customers/table.tsx";

// biome-ignore lint/style/useComponentExportOnlyModules: just ignore this rule
export const metadata: Metadata = {
	title: "Customers",
};

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this format
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
