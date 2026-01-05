import type { Metadata } from "next";
import type { JSX } from "react";
import type { FormattedCustomersTableRow } from "@/modules/customers/domain/types";
import { readFilteredCustomersAction } from "@/modules/customers/infrastructure/actions/read-filtered-customers.action";
import { CustomersTable } from "@/modules/customers/presentation/components/customers-table";

interface CustomersSearchParams {
  query?: string;
  page?: string;
}

interface CustomersPageProps {
  searchParams?: Promise<CustomersSearchParams>;
}

// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const metadata: Metadata = {
  title: "Customers",
};

// force this page to be dynamic, so it doesn't get cached. otherwise, the next build will fail
// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
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
