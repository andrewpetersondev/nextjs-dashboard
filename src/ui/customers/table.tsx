import type { JSX } from "react";
import type { FormattedCustomersTableRow } from "@/features/customers/customer.types";
import { DesktopTable } from "@/ui/customers/desktop-table";
import { MobileTable } from "@/ui/customers/mobile-table";
import { H1 } from "@/ui/headings";
import { Search } from "@/ui/search";

interface CustomersTableProps {
  customers: FormattedCustomersTableRow[];
}

export async function CustomersTable({
  customers,
}: CustomersTableProps): Promise<JSX.Element> {
  return (
    <section aria-labelledby="customers-heading" className="w-full">
      <H1 className="mb-8" id="customers-heading">
        Customers
      </H1>
      <Search placeholder="Search customers..." />
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-bg-accent p-2 md:pt-0">
              <MobileTable customers={customers} />
              <DesktopTable customers={customers} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
