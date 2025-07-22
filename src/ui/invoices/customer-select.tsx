/**
 * @file CustomerSelect.tsx
 * @description Accessible customer dropdown for invoice forms.
 * @module CustomerSelect
 */

import type { JSX } from "react";
import { ErrorMessage } from "@/components/error-message";
import { SelectMenu, type SelectMenuProps } from "@/components/select-menu";
import type { CustomerField } from "@/features/customers/customer.types";

/**
 * Props for the CustomerSelect component.
 * @remarks
 * - `customers`: List of customers to select from.
 * - `error`: Optional error messages for validation.
 */
export interface CustomerSelectProps
  extends Omit<SelectMenuProps<CustomerField>, "options" | "id" | "name"> {
  readonly customers: readonly CustomerField[];
  readonly error?: readonly string[] | undefined;
}

/**
 * Accessible customer dropdown for invoice forms.
 * Ensures a valid customer is selected before submission.
 */
export const CustomerSelect = ({
  customers,
  error,
  ...props
}: CustomerSelectProps): JSX.Element => (
  <div>
    <SelectMenu
      aria-describedby={error ? "customer-select-error" : undefined}
      aria-invalid={!!error}
      defaultValue=""
      id="customer"
      name="customerId"
      options={customers}
      placeholder="Select a customer"
      required
      {...props}
    />
    {error && error.length > 0 && (
      <ErrorMessage
        dataCy="customer-select-error"
        error={error}
        id="customer-select-error"
        label="Customer selection error"
      />
    )}
  </div>
);
