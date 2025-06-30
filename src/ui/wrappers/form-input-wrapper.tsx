import type { JSX } from "react";

export const FormInputWrapper = ({ children }: { children: JSX.Element }) => (
	<div className="mb-4">
		<div className="rounded-md p-4">{children}</div>
	</div>
);
