import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { readCustomersAction } from "@/features/customers/customer.actions";
import type { CustomerField } from "@/features/customers/customer.types";
import { readInvoiceAction } from "@/features/invoices/invoice.actions";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import { H1 } from "@/ui/headings";
import { Breadcrumbs } from "@/ui/invoices/breadcrumbs";
import { EditInvoiceForm } from "@/ui/invoices/edit-invoice-form";

export const metadata: Metadata = {
  title: "Edit Invoice",
};

// force this page to be dynamic, so it doesn't get cached. otherwise, the next build will fail
export const dynamic = "force-dynamic";

interface EditInvoicePageParams {
  id: string;
}

interface EditInvoicePageProps {
  params: Promise<EditInvoicePageParams>;
}

export default async function Page(
  props: EditInvoicePageProps,
): Promise<JSX.Element> {
  const { id } = await props.params;

  const [customers, invoice] = await Promise.all([
    readCustomersAction(),
    readInvoiceAction(id),
  ]);

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
      <H1>edit invoice</H1>

      <section>
        <p>Edit some stuff.</p>
      </section>

      <EditInvoiceForm customers={customers} invoice={invoice} />
    </main>
  );
}
