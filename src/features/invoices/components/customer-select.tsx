/**
 * @file CustomerSelect.tsx
 * @description Accessible customer dropdown for invoice forms.
 * @module CustomerSelect
 */

import type { JSX } from "react";
import type { CustomerField } from "@/features/customers/types";
import { SelectMenu, type SelectMenuProps } from "@/ui/atoms/select-menu";
import { ErrorMessage } from "@/ui/forms/error-message";

/**
 * Props for the CustomerSelect component.
 * @remarks
 * - `customers`: List of customers to select from.
 * - `error`: Optional error messages for validation.
 */
export interface CustomerSelectProps
  extends Omit<SelectMenuProps<CustomerField>, "options" | "id" | "name"> {
  readonly customers: readonly CustomerField[];
  readonly error?: import("@/shared/forms/form-types").FieldError;
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
        required={true}
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
