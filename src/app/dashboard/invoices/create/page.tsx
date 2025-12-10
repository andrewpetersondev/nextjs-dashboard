import type { Metadata } from "next";
import type { JSX } from "react";
import type { CustomerField } from "@/modules/customers/domain/types";
import { readCustomersAction } from "@/modules/customers/server/application/actions/read-customers.action";
import { CreateInvoiceForm } from "@/modules/invoices/ui/components/forms/create-invoice-form";
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
