"use client";
import { AtSymbolIcon, UserIcon } from "@heroicons/react/24/outline";
import { type JSX, useId } from "react";
import { CUSTOMER_FORM_LABELS } from "@/modules/customers/domain/constants";
import type { FieldError } from "@/shared/forms/core/field-error.types";
import { InputFieldMolecule } from "@/ui/molecules/input-field.molecule";

/**
 * Narrows a possibly-empty error list to `FieldError`, which is a NON-empty
 * array.
 *
 * Destructuring rather than casting is deliberate: an empty array is exactly
 * what a dense map holds for a valid field, and casting one to `FieldError`
 * would hand the input a "there is an error" value describing no error.
 */
function toFieldError(
	errors: readonly string[] | undefined,
): FieldError | undefined {
	const [first, ...rest] = errors ?? [];
	return first === undefined ? undefined : [first, ...rest];
}

export type CustomerFieldNames = "email" | "name";

/**
 * The shape `extractFieldErrors` actually returns: a DENSE map, so every field
 * is present and a field with no errors holds an empty array.
 */
export type CustomerFieldErrors = Partial<
	Record<CustomerFieldNames, readonly string[]>
>;

/**
 * The name + email inputs, shared by the create and edit forms.
 *
 * @remarks
 * Create and edit differ only in whether the inputs are `required` and whether
 * they carry a default — so they share one component rather than two
 * near-identical copies. `required` is false on edit because a blank field
 * there means "leave unchanged", which the edit schema encodes by preprocessing
 * "" to undefined.
 */
export function CustomerFormFields({
	defaultValues,
	disabled = false,
	errors,
	required,
}: {
	defaultValues?: { readonly email: string; readonly name: string };
	disabled?: boolean;
	errors?: CustomerFieldErrors;
	required: boolean;
}): JSX.Element {
	const emailId = useId();
	const nameId = useId();

	return (
		<div className="space-y-6">
			<InputFieldMolecule
				autoComplete="organization"
				dataCy="customer-name-input"
				defaultValue={defaultValues?.name}
				disabled={disabled}
				error={toFieldError(errors?.name)}
				icon={
					<UserIcon className="pointer-events-none ml-2 h-4.5 w-4.5 text-text-accent" />
				}
				id={nameId}
				label={CUSTOMER_FORM_LABELS.name}
				name="name"
				placeholder="Amy Burns"
				required={required}
				type="text"
			/>

			<InputFieldMolecule
				autoComplete="email"
				dataCy="customer-email-input"
				defaultValue={defaultValues?.email}
				disabled={disabled}
				error={toFieldError(errors?.email)}
				icon={
					<AtSymbolIcon className="pointer-events-none ml-2 h-4.5 w-4.5 text-text-accent" />
				}
				id={emailId}
				label={CUSTOMER_FORM_LABELS.email}
				name="email"
				placeholder="amy@burns.com"
				required={required}
				type="email"
			/>
		</div>
	);
}
