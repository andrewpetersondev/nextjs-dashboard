import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import type { CustomerField } from "@/features/customers/types";
import { EditInvoiceForm } from "@/features/invoices/components/edit-invoice-form";
import type { InvoiceDto } from "@/features/invoices/lib/dto";
import { readCustomersAction } from "@/server/customers/actions/read";
import { readInvoiceByIdAction } from "@/server/invoices/actions/read-by-id";
import { H1 } from "@/ui/atoms/typography/headings";
import { Breadcrumbs } from "@/ui/navigation/breadcrumbs";

interface EditInvoicePageParams {
  id: string;
}

interface EditInvoicePageProps {
  params: Promise<EditInvoicePageParams>;
}

export const metadata: Metadata = {
  title: "Edit Invoice",
};

// force this page to be dynamic, so it doesn't get cached. otherwise, the next build will fail
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
