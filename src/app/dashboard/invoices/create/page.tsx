import type { Metadata } from "next";
import type { JSX } from "react";
import type { CustomerField } from "@/features/customers/types";
import { readCustomersAction } from "@/server/actions/customer";
import { Breadcrumbs } from "@/ui/invoices/breadcrumbs";
import { CreateInvoiceForm } from "@/ui/invoices/create-invoice-form";

export const metadata: Metadata = {
  title: "Create Invoice",
};

// force this page to be dynamic, so it doesn't get cached. otherwise, the next build will fail
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
