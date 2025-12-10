/**
 * @file CustomerSelect.tsx
 * @description Accessible customer dropdown for invoice forms.
 * @module CustomerSelect
 */

import { UserCircleIcon } from "@heroicons/react/24/outline";
import { type JSX, useId } from "react";
import type { CustomerField } from "@/modules/customers/domain/types";
import type { FieldError } from "@/shared/forms/types/form.types";
import type { SelectMenuProps } from "@/ui/atoms/select-menu";
import { SelectField } from "@/ui/molecules/select-field";

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

  return (
    <SelectField
      defaultValue=""
      error={error}
      icon={UserCircleIcon}
      id={id}
      label="Choose customer"
      name="customerId"
      options={[...customers]}
      placeholder="Select a customer"
      required={true}
      {...props}
    />
  );
};
