import type { JSX } from "react";

export function InputFieldCard({ children }: { children: JSX.Element }) {
	return (
		<div className="mb-4">
			<div className="bg-bg-secondary rounded-md p-4 md:p-6">{children}</div>
		</div>
	);
}
