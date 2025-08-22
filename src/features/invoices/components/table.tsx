import type { JSX } from "react";
import { DesktopTable } from "@/features/invoices/components/desktop-table";
import { MobileTable } from "@/features/invoices/components/mobile-table";
import { readFilteredInvoicesAction } from "@/server/invoices/actions";
import type { InvoiceListFilter } from "@/server/invoices/types";

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
        <div className="rounded-lg bg-bg-accent p-2 md:pt-0">
          <MobileTable invoices={invoices} />
          <DesktopTable invoices={invoices} />
        </div>
      </div>
    </div>
  );
};
