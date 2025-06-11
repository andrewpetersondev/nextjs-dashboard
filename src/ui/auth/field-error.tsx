import { type JSX, type NamedExoticComponent, memo } from "react";

export interface FieldErrorProps {
	id?: string;
	error?: string[];
	dataCy?: string;
	label?: string;
}

export const FieldError: NamedExoticComponent<FieldErrorProps> = memo(
	function FieldError({
		id,
		error,
		dataCy,
		label,
	}: FieldErrorProps): JSX.Element | null {
		// This component is now used for all field errors (email, username, password)
		if (!error?.length) return null;
		return (
			<div id={id} data-cy={dataCy} className="text-text-error">
				{label && <p>{label}</p>}
				<ul>
					{error.map(
						(err: string): JSX.Element => (
							<li key={err}>- {err}</li>
						),
					)}
				</ul>
			</div>
		);
	},
);
