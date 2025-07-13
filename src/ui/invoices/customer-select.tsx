import type React from "react";
import { ErrorMessage } from "@/components/error-message";
import { SelectMenu, type SelectMenuProps } from "@/components/select-menu";
import type { CustomerField } from "@/features/customers/customer.types";

/**
 * Props for the CustomerSelect component.
 */
interface CustomerSelectProps
  extends Omit<SelectMenuProps<CustomerField>, "options" | "id" | "name"> {
  customers: CustomerField[];
  error?: string[] | undefined;
}

/**
 * The CustomerSelect dropdown component.
 */
export const CustomerSelect: React.FC<CustomerSelectProps> = ({
  customers,
  error,
  ...props
}) => (
  <div>
    <SelectMenu
      error={error}
      id="customer"
      name="customerId"
      options={customers}
      placeholder="Select a customer"
      {...props}
    />
    <ErrorMessage
      dataCy="customer-select-error"
      error={error} // todo: should this be errors like in InvoiceAmountInput? That would be more consistent and versatile.
      id="customer-select-error"
      label="Customer selection error"
    />
  </div>
);
