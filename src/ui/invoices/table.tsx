import { fetchFilteredInvoices } from "@/src/lib/data";
import DesktopTable from "@/src/ui/invoices/desktop-table";
import MobileTable from "@/src/ui/invoices/mobile-table";

export default async function InvoicesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const invoices = await fetchFilteredInvoices(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="bg-bg-accent rounded-lg p-2 md:pt-0">
          <MobileTable invoices={invoices} />
          <DesktopTable invoices={invoices} />
        </div>
      </div>
    </div>
  );
}
