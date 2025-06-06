import { fetchFilteredCustomers } from "@/src/lib/data";
import type { FormattedCustomersTableRow } from "@/src/lib/definitions/customers";
import CustomersTable from "@/src/ui/customers/table";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Customers",
};

export const dynamic = "force-dynamic"; // force this page to be dynamic, so it doesn't get cached
export default async function Page(props: {
	searchParams?: Promise<{
		query?: string;
		page?: string;
	}>;
}) {
	const searchParams:
		| {
				query?: string;
				page?: string;
		  }
		| undefined = await props.searchParams;
	const query: string = searchParams?.query || "";

	const customers: FormattedCustomersTableRow[] =
		await fetchFilteredCustomers(query);

	return (
		<main>
			<CustomersTable customers={customers} />
		</main>
	);
}
