import type { Metadata } from "next";
import type { JSX } from "react";
import type { CustomerField } from "@/features/customers/domain/types";
import { CreateInvoiceForm } from "@/features/invoices/components/create-invoice-form";
import { readCustomersAction } from "@/server/customers/application/actions/read";
import { Breadcrumbs } from "@/ui/navigation/breadcrumbs";

// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const metadata: Metadata = {
  title: "Create Invoice",
};

// force this page to be dynamic, so it doesn't get cached. otherwise, the next build will fail
// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const dynamic = "force-dynamic";

export default async function Page(): Promise<JSX.Element> {
  const customers: CustomerField[] = await readCustomersAction();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            href: "/dashboard/invoices",
            label: "Invoices",
          },
          {
            active: true,
            href: "/dashboard/invoices/create",
            label: "Create Invoice",
          },
        ]}
      />
      <CreateInvoiceForm customers={customers} />
    </main>
  );
}
