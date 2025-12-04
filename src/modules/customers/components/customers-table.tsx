import { type JSX, useId } from "react";
import { CustomersTableDesktop } from "@/modules/customers/components/customers-table-desktop";
import { CustomersTableMobile } from "@/modules/customers/components/customers-table-mobile";
import type { FormattedCustomersTableRow } from "@/modules/customers/domain/types";
import { H1 } from "@/ui/atoms/typography/headings";
import { Search } from "@/ui/molecules/search-box";

interface CustomersTableProps {
  customers: FormattedCustomersTableRow[];
}

export function CustomersTable({
  customers,
}: CustomersTableProps): JSX.Element {
  const headingId = useId();

  return (
    <section
      aria-labelledby="customers-heading"
      className="w-full"
      data-cy="customers-section"
    >
      <H1 className="mb-8" id={headingId}>
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
