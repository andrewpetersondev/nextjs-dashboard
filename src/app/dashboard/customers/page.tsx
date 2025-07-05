import type { Metadata } from "next";
import type { JSX } from "react";
import type { FormattedCustomersTableRow } from "@/src/lib/definitions/customers.types";
import { readFilteredCustomersAction } from "@/src/lib/server-actions/customers.actions";
import { CustomersTable } from "@/src/ui/customers/table";

export const metadata: Metadata = {
	title: "Customers",
};

// force this page to be dynamic, so it doesn't get cached. otherwise, the next build will fail
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
		await readFilteredCustomersAction(query);

	return (
		<main>
			<CustomersTable customers={customers} />
		</main>
	);
}
