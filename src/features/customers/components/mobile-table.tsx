import type { JSX } from "react";
import type { FormattedCustomersTableRow } from "@/features/customers/types";
import { CustomerMobileCard } from "./customer-mobile-card";

/**
 * Renders a responsive mobile table for customer data.
 * @param customers - Array of formatted customer table rows.
 * @returns JSX.Element
 */
export async function MobileTable({
  customers,
}: {
  customers: FormattedCustomersTableRow[];
}): Promise<JSX.Element> {
  return (
    <div className="md:hidden" data-testid="mobile-table">
      {customers.map((customer) => (
        <CustomerMobileCard customer={customer} key={customer.id} />
      ))}
    </div>
  );
}
