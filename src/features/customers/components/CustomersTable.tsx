import type { JSX } from "react";
import { CustomersTableDesktop } from "@/features/customers/components/CustomersTableDesktop";
import { CustomersTableMobile } from "@/features/customers/components/CustomersTableMobile";
import type { FormattedCustomersTableRow } from "@/features/customers/types";
import { H1 } from "@/ui/atoms/typography/headings";
import { Search } from "@/ui/molecules/search-box";

interface CustomersTableProps {
  customers: FormattedCustomersTableRow[];
}

export function CustomersTable({
  customers,
}: CustomersTableProps): JSX.Element {
  return (
    <section
      aria-labelledby="customers-heading"
      className="w-full"
      data-cy="customers-section"
    >
      <H1 className="mb-8" id="customers-heading">
        Customers
      </H1>
      <Search placeholder="Search customers..." />
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-bg-accent p-2 md:pt-0">
              <CustomersTableMobile customers={customers} />
              <CustomersTableDesktop customers={customers} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
