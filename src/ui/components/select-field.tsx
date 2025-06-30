import type React from "react";
import { FieldError } from "@/src/ui/auth/field-error.tsx";
import { Label } from "@/src/ui/components/label.tsx";
import { SelectMenu } from "@/src/ui/components/select-menu.tsx";

type SelectFieldProps<T extends { id: string | number; name: string }> = {
	label: string;
	options: T[];
	id: string;
	name: string;
	placeholder?: string;
	error?: string[];
	dataCy?: string;
	className?: string;
	disabled?: boolean;
	defaultValue?: string | number;
	onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

export function _SelectField<T extends { id: string | number; name: string }>(
	props: SelectFieldProps<T>,
) {
	const {
		label,
		id,
		name,
		options,
		placeholder,
		error,
		dataCy,
		className,
		disabled,
		defaultValue,
		onChange,
	} = props;
	return (
		<div className="mb-4">
			<Label htmlFor={id} text={label} />
			<SelectMenu
				className={className}
				dataCy={dataCy}
				defaultValue={defaultValue}
				disabled={disabled}
				id={id}
				name={name}
				onChange={onChange}
				options={options}
				placeholder={placeholder}
			/>
			{error && (
				<div className="mt-2">
					<FieldError error={error} id={`${id}-error`} />
				</div>
			)}
		</div>
	);
}
