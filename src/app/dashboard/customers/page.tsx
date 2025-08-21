import type { Metadata } from "next";
import type { JSX } from "react";
import type { FormattedCustomersTableRow } from "@/features/customers/types";
import { readFilteredCustomersAction } from "@/server/actions/customer";
import { CustomersTable } from "@/ui/customers/table";

export const metadata: Metadata = {
  title: "Customers",
};

// force this page to be dynamic, so it doesn't get cached. otherwise, the next build will fail
export const dynamic = "force-dynamic";

interface CustomersSearchParams {
  query?: string;
  page?: string;
}

interface CustomersPageProps {
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
