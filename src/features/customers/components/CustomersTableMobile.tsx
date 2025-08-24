import type { JSX } from "react";
import type { FormattedCustomersTableRow } from "@/features/customers/types";
import { CustomersTableMobileRow } from "./CustomersTableMobileRow";

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
    <div className="md:hidden" data-testid="mobile-table">
      {customers.map((customer) => (
        <CustomersTableMobileRow customer={customer} key={customer.id} />
      ))}
    </div>
  );
}
