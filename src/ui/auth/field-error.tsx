import { memo } from "react";

export interface FieldErrorProps {
	id?: string;
	error?: string[];
	dataCy?: string;
	label?: string;
}

export const FieldError = memo(function FieldError({
	id,
	error,
	dataCy,
	label,
}: FieldErrorProps) {
	// This component is now used for all field errors (email, username, password)
	if (!error?.length) return null;
	return (
		<div id={id} data-cy={dataCy} className="text-text-error">
			{label && <p>{label}</p>}
			<ul>
				{error.map((err) => (
					<li key={err}>- {err}</li>
				))}
			</ul>
		</div>
	);
});
