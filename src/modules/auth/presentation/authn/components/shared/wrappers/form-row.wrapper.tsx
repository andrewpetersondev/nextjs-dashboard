import type { JSX, ReactNode } from "react";

/** Spacing shell for one auth form row — layout only, no semantics or field logic. */
export function FormRowWrapper({
	children,
}: {
	children: ReactNode;
}): JSX.Element {
	return (
		<div className="mb-4">
			<div className="rounded-md p-4">{children}</div>
		</div>
	);
}
