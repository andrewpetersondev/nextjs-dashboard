/**
 * @file CustomerSelect.tsx
 * @description Accessible customer dropdown for invoice forms.
 * @module CustomerSelect
 */

import { type JSX, useId } from "react";
import type { CustomerField } from "@/features/customers/types";
import type { FieldError } from "@/shared/forms/domain/models/field-error";
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
  readonly error?: FieldError;
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
  const customerSelectMenuId = useId();
  const ErrorId = "customer-select-error";
  const hasError = Boolean(error && error.length > 0);
  return (
    <div>
      <SelectMenu
        aria-describedby={hasError ? ErrorId : undefined}
        aria-invalid={hasError}
        defaultValue=""
        id={customerSelectMenuId}
        name="customerId"
        options={[...customers]}
        placeholder="Select a customer"
        required={true}
        {...props}
      />
      {hasError && (
        <ErrorMessage
          dataCy={ErrorId}
          error={error}
          id={ErrorId}
          label="Customer selection error"
        />
      )}
    </div>
  );
};
