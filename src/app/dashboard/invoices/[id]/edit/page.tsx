import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import type { CustomerField } from "@/modules/customers/domain/types";
import { readCustomersAction } from "@/modules/customers/server/application/actions/read-customers.action";
import type { InvoiceDto } from "@/modules/invoices/domain/dto";
import { readInvoiceByIdAction } from "@/modules/invoices/server/application/actions/read-invoice-by-id.action";
import { EditInvoiceForm } from "@/modules/invoices/ui/components/forms/edit-invoice-form";
import { H1 } from "@/ui/atoms/headings";
import { Breadcrumbs } from "@/ui/navigation/breadcrumbs";

interface EditInvoicePageParams {
  id: string;
}

interface EditInvoicePageProps {
  params: Promise<EditInvoicePageParams>;
}

// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const metadata: Metadata = {
  title: "Edit Invoice",
};

// force this page to be dynamic, so it doesn't get cached. otherwise, the next build will fail
// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const dynamic = "force-dynamic";

export default async function Page(
  props: EditInvoicePageProps,
): Promise<JSX.Element> {
  const { id } = await props.params;

  const [customers, invoice]: [CustomerField[], InvoiceDto] = await Promise.all(
    [readCustomersAction(), readInvoiceByIdAction(id)],
  );

  if (!invoice) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { href: "/dashboard/invoices", label: "Invoices" },
          {
            active: true,
            href: `/dashboard/invoices/${id}/edit`,
            label: "Edit Invoice",
          },
        ]}
      />
      <H1 className="mb-4">edit invoice</H1>

      <EditInvoiceForm customers={customers} invoice={invoice} />
    </main>
  );
}
