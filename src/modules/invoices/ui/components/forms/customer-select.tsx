import { UserCircleIcon } from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { useId } from "react";
import type { CustomerField } from "@/modules/customers/domain/types";
import type { FieldError } from "@/shared/forms/types/form.types";
import type { SelectMenuProps } from "@/ui/atoms/select-menu.atom";
import { SelectFieldMolecule } from "@/ui/molecules/select-field.molecule";

/**
 * Props for the CustomerSelect component.
 */
export interface CustomerSelectProps
  extends Omit<SelectMenuProps<CustomerField>, "id" | "name" | "options"> {
  readonly customers: readonly CustomerField[];
  readonly dataCy?: string;
  readonly error?: FieldError;
}

/**
 * Accessible customer dropdown for invoice forms.
 * Ensures a valid customer is selected before submission.
 * @param customers - List of customers to select from.
 * @param error - Validation errors for the customer field.
 * @param dataCy - Test identifier for the component.
 * @param props - Additional props for the SelectMenu component.
 */
export const CustomerSelect = ({
  customers,
  dataCy,
  error,
  ...props
}: CustomerSelectProps): JSX.Element => {
  const id = useId();

  return (
    <SelectFieldMolecule
      dataCy={dataCy}
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
