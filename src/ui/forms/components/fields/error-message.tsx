import type { JSX } from "react";
import type { FieldError } from "@/shared/forms/core/types/field-error.types";

interface ErrorMessageProps {
	dataCy?: string;
	error?: FieldError;
	id?: string;
	label?: string;
}

/**
 * Form error renderer for dense validation messages.
 */
export function ErrorMessage({
	dataCy,
	error,
	id,
	label,
}: ErrorMessageProps): JSX.Element | null {
	if (!error || error.length === 0) {
		return null;
	}

	return (
		<div
			aria-live="assertive"
			className="mt-2 text-sm text-text-error"
			data-cy={dataCy}
			id={id}
			role="alert"
		>
			{label ? <p className="font-semibold">{label}</p> : null}
			<ul className="list-disc space-y-1 pl-5">
				{error.map((err) => (
					<li key={err}>{err}</li>
				))}
			</ul>
		</div>
	);
}
