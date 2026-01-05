import { type JSX, useId } from "react";
import type { FormattedCustomersTableRow } from "@/modules/customers/domain/types";
import { CustomersTableDesktop } from "@/modules/customers/presentation/components/customers-table-desktop";
import { CustomersTableMobile } from "@/modules/customers/presentation/components/customers-table-mobile";
import { H1 } from "@/ui/atoms/headings";
import { SearchBoxMolecule } from "@/ui/molecules/search-box.molecule";

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
      <SearchBoxMolecule placeholder="Search customers..." />
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
