import type React from "react";
import type { CustomerField } from "@/src/lib/definitions/customers.types";
import {
	SelectMenu,
	type SelectMenuProps,
} from "@/src/ui/components/select-menu";

/**
 * Props for CustomerSelect component.
 */
export interface CustomerSelectProps
	extends Omit<SelectMenuProps<CustomerField>, "options" | "id" | "name"> {
	customers: CustomerField[];
	error?: string[];
}

/**
 * Customer select dropdown component.
 */
export const CustomerSelect: React.FC<CustomerSelectProps> = ({
	customers,
	error,
	...props
}) => (
	<SelectMenu
		error={error}
		id="customer"
		name="customerId"
		options={customers}
		placeholder="Select a customer"
		{...props}
	/>
);
