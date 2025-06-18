import { type JSX, memo, type NamedExoticComponent } from "react";

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
			<div className="text-text-error" data-cy={dataCy} id={id}>
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
