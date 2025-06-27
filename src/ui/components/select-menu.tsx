import { UserCircleIcon } from "@heroicons/react/24/outline";
import React from "react";

// TODO: Make this a controlled component in the future. (value instead of defaultValue)

/**
 * Props for the SelectMenu component.
 * @template T - The type of the option object.
 */
export interface SelectMenuProps<
	T extends { id: string | number; name: string },
> {
	/** Options to display in the select menu. */
	options: T[];
	/** The selected value. */
	defaultValue?: string | number;
	/** The select element's id. */
	id: string;
	/** The select element's name. */
	name: string;
	/** Placeholder text for the select menu. */
	placeholder?: string;
	/** Called when the selection changes. */
	onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
	/** Additional class names for styling. */
	className?: string;
	/** Data attribute for Cypress testing. */
	dataCy?: string;
	/** Whether the select is disabled. */
	disabled?: boolean;
}

/**
 * Accessible, reusable select menu component.
 * @template T - The type of the option object.
 */
export const SelectMenu = React.memo(
	<T extends { id: string | number; name: string }>({
		options,
		defaultValue,
		id,
		name,
		placeholder = "Select an option",
		onChange,
		className = "",
		dataCy,
		disabled = false,
	}: SelectMenuProps<T>) => (
		<div className="relative">
			<select
				aria-label={placeholder}
				className={`peer border-bg-accent placeholder:text-text-secondary block w-full cursor-pointer rounded-md border py-2 pl-10 text-sm outline-2 ${className}`}
				data-cy={dataCy}
				defaultValue={defaultValue}
				disabled={disabled}
				id={id}
				name={name}
				onChange={onChange}
			>
				<option disabled={true} value="">
					{placeholder}
				</option>
				{options.map((option) => (
					<option key={option.id} value={option.id}>
						{option.name}
					</option>
				))}
			</select>
			<UserCircleIcon className="text-text-primary pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2" />
		</div>
	),
);

SelectMenu.displayName = "SelectMenu";

export default SelectMenu;
