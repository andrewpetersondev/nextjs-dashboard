import type { JSX } from "react";

interface FieldErrorProps {
	dataCy?: string;
	error?: readonly string[] | undefined;
	id?: string;
	label?: string;
}

/**
 * Field-level validation feedback.
 */
export function FieldErrorComponent({
	dataCy,
	error,
	id,
	label,
}: FieldErrorProps): JSX.Element | null {
	if (!error || error.length === 0) {
		return null;
	}

	return (
		<div
			aria-live="polite"
			className="mt-2 text-sm text-text-error"
			data-cy={dataCy}
			id={id}
			role="alert"
		>
			{label ? <p className="font-semibold">{label}</p> : null}
			<ul className="list-disc space-y-1 pl-5">
				{error.map((message, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: error items are message-only and may repeat
					<li key={`${message}-${index}`}>{message}</li>
				))}
			</ul>
		</div>
	);
}
