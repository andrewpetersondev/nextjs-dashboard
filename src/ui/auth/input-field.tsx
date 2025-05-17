import { memo, type ReactElement } from "react";

/**
 * Props for InputField component.
 * @remarks
 * Use for all text/email input fields in auth forms.
 */
export type InputFieldProps = Readonly<{
	id: string;
	name: string;
	type: string;
	label: string;
	autoComplete?: string;
	required?: boolean;
	icon?: ReactElement;
	error?: string | string[];
	dataCy?: string;
	placeholder?: string;
}>;

/**
 * Reusable input field with label and error display.
 */
export const InputField = memo(function InputField({
	id,
	name,
	type,
	label,
	autoComplete,
	required = false,
	icon,
	error,
	dataCy,
	placeholder,
}: InputFieldProps) {
	const errorText =
		Array.isArray(error) ? error.join(", ") : error;

	return (
		<div>
			<label
				htmlFor={id}
				className="text-text-secondary block text-sm/6 font-medium"
			>
				{label}
			</label>
			<div className="@container mt-2 flex items-center">
				<input
					id={id}
					name={name}
					type={type}
					required={required}
					autoComplete={autoComplete}
					placeholder={placeholder}
					aria-invalid={!!errorText}
					aria-describedby={errorText ? `${id}-error` : undefined}
					className="bg-bg-accent text-text-primary ring-bg-accent placeholder:text-text-accent focus:ring-bg-focus block w-full rounded-md px-3 py-1.5 ring-1 ring-inset focus:ring-2 sm:text-sm/6"
					data-cy={dataCy}
				/>
				{icon}
			</div>
			{errorText && (
				<p
					id={`${id}-error`}
					className="text-text-error"
					data-cy={`signup-${name}-errors`}
					aria-live="polite"
				>
					{errorText}
				</p>
			)}
		</div>
	);
});
