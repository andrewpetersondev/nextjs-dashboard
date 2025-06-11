import { FieldError } from "@/src/ui/auth/field-error";
import {
	type ForwardedRef,
	type InputHTMLAttributes,
	type JSX,
	type ReactNode,
	forwardRef,
} from "react";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
	/** Unique id for the input and label */
	id: string;
	/** Label text for the input */
	label: string;
	/** Optional icon rendered inside the input */
	icon?: ReactNode;
	/** Error messages to display */
	error?: string[];
	/** Data attribute for testing */
	dataCy?: string;
	/** ID for aria-describedby */
	describedById?: string;
}

/**
 * Reusable input field with label, icon, and error display.
 * @param props - InputFieldProps
 * @param ref - Forwarded ref to the input element
 * @returns JSX.Element
 */
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
	function InputField(
		{
			id,
			label,
			icon,
			error,
			dataCy,
			describedById,
			...props
		}: InputFieldProps,
		ref: ForwardedRef<HTMLInputElement>,
	): JSX.Element {
		return (
			<div>
				<label htmlFor={id} className="block text-sm/6 font-medium">
					{label}
				</label>
				<div className="mt-2 flex items-center">
					<input
						id={id}
						name={id}
						aria-invalid={!!error?.length}
						aria-describedby={
							error?.length ? (describedById ?? `${id}-errors`) : undefined
						}
						className="bg-bg-accent text-text-primary ring-bg-accent placeholder:text-text-accent focus:ring-bg-focus block w-full rounded-md px-3 py-1.5 ring-1 ring-inset focus:ring-2 sm:text-sm/6"
						data-cy={dataCy}
						ref={ref}
						{...props}
					/>
					{icon}
				</div>
				<FieldError
					id={describedById ?? `${id}-errors`}
					error={error}
					dataCy={dataCy ? `${dataCy}-errors` : undefined}
					label={error?.length ? `${label} error:` : undefined}
				/>
			</div>
		);
	},
);
