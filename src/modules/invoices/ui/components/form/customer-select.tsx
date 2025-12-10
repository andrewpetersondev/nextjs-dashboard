/**
 * @file CustomerSelect.tsx
 * @description Accessible customer dropdown for invoice forms.
 * @module CustomerSelect
 */

import { UserCircleIcon } from "@heroicons/react/24/outline";
import { type JSX, useId } from "react";
import type { CustomerField } from "@/modules/customers/domain/types";
import { ErrorMessage } from "@/shared/forms/components/error-message";
import type { FieldError } from "@/shared/forms/types/form.types";
import { Label } from "@/ui/atoms/label";
import { SelectMenu, type SelectMenuProps } from "@/ui/atoms/select-menu";

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
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="mb-4">
      <Label htmlFor={id} text="Choose customer" />
      <SelectMenu
        defaultValue=""
        error={error}
        errorId={errorId}
        icon={UserCircleIcon}
        id={id}
        name="customerId"
        options={[...customers]}
        placeholder="Select a customer"
        required={true}
        {...props}
      />
      <ErrorMessage
        dataCy={props.dataCy ? `${props.dataCy}-error` : undefined}
        error={error}
        id={errorId}
        label="Choose customer error"
      />
    </div>
  );
};
