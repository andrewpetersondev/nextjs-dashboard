import type React from "react";
import type { CustomerField } from "@/src/lib/definitions/customers";
import { SelectMenu, type SelectMenuProps } from "../components/select-menu";

/**
 * Props for CustomerSelect component.
 */
export interface CustomerSelectProps
	extends Omit<SelectMenuProps<CustomerField>, "options" | "id" | "name"> {
	customers: CustomerField[];
}

/**
 * Customer select dropdown component.
 */
export const CustomerSelect: React.FC<CustomerSelectProps> = ({
	customers,
	...props
}) => (
	<SelectMenu
		id="customer"
		name="customerId"
		options={customers}
		placeholder="Select a customer"
		{...props}
	/>
);

export default CustomerSelect;
