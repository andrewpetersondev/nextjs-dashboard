import { memo } from "react";

/**
 * Props for PasswordField component.
 * @remarks
 * Use for all password input fields in auth forms.
 */
export type PasswordFieldProps = Readonly<{
	id?: string;
	name?: string;
	label?: string;
	autoComplete?: string;
	required?: boolean;
	error?: string[] | string;
	dataCy?: string;
	placeholder?: string;
	describedById?: string;
}>;

/**
 * Reusable password input field with label and error display.
 */
export const PasswordField = memo(function PasswordField({
	id = "password",
	name = "password",
	label = "Password",
	autoComplete = "current-password",
	required = true,
	error,
	dataCy = "password-input",
	placeholder,
	describedById,
}: PasswordFieldProps) {
	const errorText = Array.isArray(error) ? error.join(", ") : error;
	const errorId = describedById || `${id}-error`;

	return (
		<div>
			<label
				htmlFor={id}
				className="text-text-secondary block text-sm/6 font-medium"
			>
				{label}
			</label>
			<div className="mt-2">
				<input
					id={id}
					name={name}
					type="password"
					required={required}
					autoComplete={autoComplete}
					placeholder={placeholder}
					className="bg-bg-accent text-text-primary ring-bg-accent placeholder:text-text-accent focus:ring-bg-focus block w-full rounded-md px-3 py-1.5 ring-1 ring-inset focus:ring-2 sm:text-sm/6"
					data-cy={dataCy}
					aria-invalid={!!errorText}
					aria-describedby={errorText ? errorId : undefined}
				/>
			</div>
			{errorText && (
				<div id={errorId} className="text-text-error" aria-live="polite">
					{Array.isArray(error) ? (
						<>
							<p>Password must:</p>
							<ul>
								{error.map((err) => (
									<li key={err} data-cy={`${dataCy}-errors`}>
										- {err}
									</li>
								))}
							</ul>
						</>
					) : (
						<p data-cy={`${dataCy}-errors`}>{errorText}</p>
					)}
				</div>
			)}
		</div>
	);
});
