import type { JSX } from "react";
import { LabelAtom } from "@/ui/atoms/label.atom";
import {
	SelectMenuAtom,
	type SelectMenuProps,
} from "@/ui/atoms/select-menu.atom";
import { FieldErrorComponentMolecule } from "@/ui/molecules/field-error-component.molecule";
import { InputFieldCardWrapper } from "@/ui/wrappers/input-field-card.wrapper";

interface SelectFieldProps<T extends { id: string; name: string }>
	extends SelectMenuProps<T> {
	dataCy?: string;
	describedById?: string;
	label: string;
}

/**
 * Reusable select field with label, card styling, and error display.
 * Mirrors the structure of InputField for consistency.
 */
export function SelectFieldMolecule<T extends { id: string; name: string }>(
	props: SelectFieldProps<T>,
): JSX.Element {
	const { id, label, error, dataCy, describedById, ...rest } = props;

	const hasError = Array.isArray(error) && error.length > 0;
	const errorId = describedById ?? `${id}-errors`;

	return (
		<InputFieldCardWrapper>
			<div>
				<LabelAtom htmlFor={id} text={label} />
				<SelectMenuAtom
					dataCy={dataCy}
					error={error}
					errorId={errorId}
					id={id}
					{...rest}
				/>
				{hasError && (
					<FieldErrorComponentMolecule
						dataCy={dataCy ? `${dataCy}-errors` : undefined}
						error={error}
						id={errorId}
						label={`${label} error:`}
					/>
				)}
			</div>
		</InputFieldCardWrapper>
	);
}
