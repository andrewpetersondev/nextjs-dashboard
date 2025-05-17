import { forwardRef, type InputHTMLAttributes } from "react";

export interface EmailInputProps extends InputHTMLAttributes<HTMLInputElement> {
	error?: boolean;
}

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
	function EmailInput({ error, ...props }, ref) {
		return (
			<input
				id="email"
				name="email"
				type="email"
				required
				placeholder="steve@jobs.com"
				autoComplete="email"
				className="text-text-secondary ring-bg-focus placeholder:text-text-disabled focus:ring-bg-focus block w-full rounded-md px-3 py-1.5 ring-1 ring-inset focus:ring-2 sm:text-sm/6"
				data-cy="login-email-input"
				aria-invalid={error}
				aria-describedby={error ? "login-email-errors" : undefined}
				ref={ref}
				{...props}
			/>
		);
	}
);
