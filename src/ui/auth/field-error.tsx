import { type JSX, memo, type NamedExoticComponent } from "react";

/**
 * Props for the FieldError component.
 */
export interface FieldErrorProps {
	dataCy?: string;
	error?: string[];
	id?: string;
	label?: string;
}

/**
 * FieldError component for displaying field-level validation errors.
 *
 * @param {FieldErrorProps} props - Component props.
 * @returns {JSX.Element | null} Rendered error messages or null if no errors.
 */
export const FieldError: NamedExoticComponent<FieldErrorProps> = memo(
	function FieldError({
		dataCy,
		error,
		id,
		label,
	}: FieldErrorProps): JSX.Element | null {
		// This component is now used for all field errors (email, username, password)
		// if (!error?.length) {
		// 	return null;
		// }

		if (!error || error.length === 0) {
			return null;
		}

		return (
			<div className="text-text-error" data-cy={dataCy} id={id} role="alert">
				{label && <p>{label}</p>}
				<ul>
					{error.map((err: string, i: number) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <the key is unique enough>
						<li key={err + i}>- {err}</li>
					))}
				</ul>
			</div>
		);
	},
);
