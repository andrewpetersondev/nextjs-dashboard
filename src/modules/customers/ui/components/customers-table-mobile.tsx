import type { JSX } from "react";
import type { FormattedCustomersTableRow } from "@/modules/customers/domain/types";
import { CustomersTableMobileRow } from "@/modules/customers/ui/components/customers-table-mobile-row";

/**
 * Renders a responsive mobile table for customer data.
 * @param customers - Array of formatted customer table rows.
 * @returns JSX.Element
 */
export function CustomersTableMobile({
  customers,
}: {
  customers: FormattedCustomersTableRow[];
}): JSX.Element {
  return (
    <div
      className="md:hidden"
      data-cy="customers-table-mobile"
      data-testid="mobile-table"
    >
      {customers.map((customer) => (
        <CustomersTableMobileRow customer={customer} key={customer.id} />
      ))}
    </div>
  );
}
