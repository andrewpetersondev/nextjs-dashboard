import { memo } from "react";
import { EmailInput } from "@/src/ui/auth/email-input";
import { FieldError } from "@/src/ui/auth/field-error";

export interface EmailFieldProps {
	error?: string[];
}

export const EmailField = memo(function EmailField({ error }: EmailFieldProps) {
	return (
		<div>
			<label htmlFor="email" className="block text-sm/6 font-medium">
				Email address
			</label>
			<div className="mt-2">
				<EmailInput error={!!error?.length} />
			</div>
			<FieldError
				id="login-email-errors"
				error={error}
				dataCy="login-email-errors"
				label={error?.length ? "Email error:" : undefined}
			/>
		</div>
	);
});
