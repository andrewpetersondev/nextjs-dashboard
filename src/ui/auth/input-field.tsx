import {
	type ForwardedRef,
	forwardRef,
	type InputHTMLAttributes,
	type JSX,
	type ReactNode,
} from "react";
import { FieldError } from "@/src/ui/auth/field-error";
import { InputFieldCard } from "@/src/ui/components/input-field-card";

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
			<InputFieldCard>
				<div>
					<label className="block text-sm/6 font-medium" htmlFor={id}>
						{label}
					</label>
					<div className="mt-2 flex items-center">
						<input
							aria-describedby={
								(error?.length ?? 0) > 0
									? (describedById ?? `${id}-errors`)
									: undefined
							}
							aria-invalid={(error?.length ?? 0) > 0}
							className="bg-bg-accent text-text-primary ring-bg-accent placeholder:text-text-accent focus:ring-bg-focus block w-full rounded-md px-3 py-1.5 ring-1 ring-inset focus:ring-2 sm:text-sm/6"
							data-cy={dataCy}
							id={id}
							name={id}
							ref={ref}
							{...props}
						/>
						{icon}
					</div>
					<FieldError
						dataCy={dataCy ? `${dataCy}-errors` : undefined}
						error={error}
						id={describedById ?? `${id}-errors`}
						label={(error?.length ?? 0) > 0 ? `${label} error:` : undefined}
					/>
				</div>
			</InputFieldCard>
		);
	},
);
