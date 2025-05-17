import { memo } from "react";
import { PasswordInput } from "@/src/ui/auth/password-input";
import { FieldError } from "@/src/ui/auth/field-error";

export interface PasswordFieldProps {
	error?: string[];
}

export const PasswordField = memo(function PasswordField({ error }: PasswordFieldProps) {
	return (
		<div>
			<label htmlFor="password" className="text-text-secondary block text-sm/6 font-medium">
				Password
			</label>
			<div className="mt-2">
				<PasswordInput error={!!error?.length} />
			</div>
			<FieldError
				id="login-password-errors"
				error={error}
				dataCy="login-password-errors"
				label={error?.length ? "Password must:" : undefined}
			/>
		</div>
	);
}
);
