import type { JSX } from "react";
import type { InvoiceListFilter } from "@/modules/invoices/domain/invoice.types";
import { readFilteredInvoicesAction } from "@/modules/invoices/infrastructure/actions/read-filtered-invoices.action";
import { DesktopTable } from "@/modules/invoices/presentation/components/tables/desktop-table";
import { MobileTable } from "@/modules/invoices/presentation/components/tables/mobile-table";

/**
 * InvoicesTable component.
 * Fetches filtered invoices using a server action and renders tables.
 */
export const InvoicesTable = async ({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}): Promise<JSX.Element> => {
  const invoices: InvoiceListFilter[] = await readFilteredInvoicesAction(
    query,
    currentPage,
  );

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div
          className="rounded-lg bg-bg-accent p-2 md:pt-0"
          data-cy="invoices-table"
        >
          <MobileTable invoices={invoices} />
          <DesktopTable invoices={invoices} />
        </div>
      </div>
    </div>
  );
};
