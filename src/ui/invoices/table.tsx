import type { JSX } from "react";
import { readFilteredInvoicesAction } from "@/features/invoices/invoice.actions";
import type { InvoiceTableRow } from "@/features/invoices/invoice.types";
import { DesktopTable } from "@/ui/invoices/desktop-table";
import { MobileTable } from "@/ui/invoices/mobile-table";

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
  const invoices: InvoiceTableRow[] = await readFilteredInvoicesAction(
    query,
    currentPage,
  );

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-bg-accent p-2 md:pt-0">
          <MobileTable invoices={invoices} />
          <DesktopTable invoices={invoices} />
        </div>
      </div>
    </div>
  );
};
