import type { Metadata } from "next";
import type { JSX } from "react";
import { CustomersTable } from "@/features/customers/components/CustomersTable";
import type { FormattedCustomersTableRow } from "@/features/customers/types";
import { readFilteredCustomersAction } from "@/server/customers/actions/actions";

interface CustomersSearchParams {
  query?: string;
  page?: string;
}

interface CustomersPageProps {
  searchParams?: Promise<CustomersSearchParams>;
}

export const metadata: Metadata = {
  title: "Customers",
};

// force this page to be dynamic, so it doesn't get cached. otherwise, the next build will fail
export const dynamic = "force-dynamic";

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
