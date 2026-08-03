import type { JSX } from "react";

interface FieldErrorProps {
	dataCy?: string;
	error?: readonly string[] | undefined;
	id?: string;
	label?: string;
}

/**
 * Field-level validation feedback.
 *
 * The container stays mounted even when there is no error: screen readers
 * only announce live regions that exist before their content arrives.
 * role="status" delivers politely — fields can error simultaneously, and a
 * chorus of assertive alerts would interrupt each other.
 */
export function FieldErrorComponentMolecule({
	dataCy,
	error,
	id,
	label,
}: FieldErrorProps): JSX.Element {
	return (
		<div id={id} role="status">
			{error && error.length > 0 ? (
				<div className="mt-2 text-sm text-text-error" data-cy={dataCy}>
					{label ? <p className="font-semibold">{label}</p> : null}
					<ul className="list-disc space-y-1 pl-5">
						{error.map((message, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: error items are message-only and may repeat
							<li key={`${message}-${index}`}>{message}</li>
						))}
					</ul>
				</div>
			) : null}
		</div>
	);
}
