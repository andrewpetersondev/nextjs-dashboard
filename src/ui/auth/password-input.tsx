import { forwardRef, type InputHTMLAttributes } from "react";

export interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
	error?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
	function PasswordInput({ error, ...props }, ref) {
		return (
			<input
				id="password"
				name="password"
				type="password"
				required
				autoComplete="current-password"
				className="bg-bg-accent text-text-primary ring-bg-accent placeholder:text-text-accent focus:ring-bg-focus block w-full rounded-md px-3 py-1.5 ring-1 ring-inset focus:ring-2 sm:text-sm/6"
				data-cy="login-password-input"
				aria-invalid={error}
				aria-describedby={error ? "login-password-errors" : undefined}
				ref={ref}
				{...props}
			/>
		);
	}
);
