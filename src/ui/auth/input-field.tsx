import { type InputHTMLAttributes, type ReactNode, forwardRef } from "react";
import { FieldError } from "./field-error";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
	id: string;
	label: string;
	icon?: ReactNode;
	error?: string[];
	dataCy?: string;
	describedById?: string;
}

/**
 * Reusable input field with label and error display.
 */
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
	function InputField(
		{ id, label, icon, error, dataCy, describedById, ...props },
		ref,
	) {
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
