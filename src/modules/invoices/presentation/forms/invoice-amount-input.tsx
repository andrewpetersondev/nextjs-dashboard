import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import type { InputHTMLAttributes, JSX } from "react";
import type { FieldError } from "@/shared/forms/core/field-error.types";
import { InputFieldMolecule } from "@/ui/molecules/input-field.molecule";
import { INPUT_ICON_CLASS } from "@/ui/styles/icons.tokens";

interface InvoiceAmountInputProps
	extends InputHTMLAttributes<HTMLInputElement> {
	dataCy?: string;
	error?: FieldError;
	label?: string;
}

/**
 * Currency field for an invoice amount, shared by the create and edit forms.
 *
 * Submits **dollars** as a string; the schema's amount codec decodes it and the
 * conversion to stored cents happens further down. `step="0.01"` only constrains
 * the browser's stepper — the schema is what actually enforces the range.
 */
export const InvoiceAmountInput = ({
	id = "amount",
	dataCy,
	label = "Choose an amount",
	error,
	...props
}: InvoiceAmountInputProps): JSX.Element => {
	return (
		<InputFieldMolecule
			dataCy={dataCy}
			error={error}
			icon={<CurrencyDollarIcon className={INPUT_ICON_CLASS} />}
			id={id}
			label={label}
			name={props.name ?? id}
			placeholder="Enter USD amount"
			step="0.01"
			type="number"
			{...props}
		/>
	);
};
