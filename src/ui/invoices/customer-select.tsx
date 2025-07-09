import type React from "react";
import type { CustomerField } from "@/src/lib/definitions/customers.types";
import { ErrorMessage } from "@/src/ui/components/error-message";
import {
	SelectMenu,
	type SelectMenuProps,
} from "@/src/ui/components/select-menu";

/**
 * Props for the CustomerSelect component.
 */
export interface CustomerSelectProps
	extends Omit<SelectMenuProps<CustomerField>, "options" | "id" | "name"> {
	customers: CustomerField[];
	error?: string[];
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
