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
  readonly error?: import("@/lib/forms/form.types").FormFieldError;
}

/**
 * Accessible customer dropdown for invoice forms.
 * Ensures a valid customer is selected before submission.
 */
export const CustomerSelect = ({
  customers,
  error,
  ...props
}: CustomerSelectProps): JSX.Element => {
  const ERROR_ID = "customer-select-error";
  const hasError = !!(error && error.length > 0);
  return (
    <div>
      <SelectMenu
        aria-describedby={hasError ? ERROR_ID : undefined}
        aria-invalid={hasError}
        defaultValue=""
        id="customer"
        name="customerId"
        options={[...customers]}
        placeholder="Select a customer"
        required
        {...props}
      />
      {hasError && (
        <ErrorMessage
          dataCy={ERROR_ID}
          error={error}
          id={ERROR_ID}
          label="Customer selection error"
        />
      )}
    </div>
  );
};
