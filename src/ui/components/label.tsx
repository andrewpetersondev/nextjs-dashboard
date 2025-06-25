import type React from "react";

export interface LabelProps
	extends React.LabelHTMLAttributes<HTMLLabelElement> {
	text: string;
	dataCy?: string;
}

/**
 * Accessible and reusable label component.
 */
export const Label: React.FC<LabelProps> = ({
	text,
	htmlFor,
	className = "",
	dataCy,
	...rest
}) => (
	<label
		className={`mb-2 block text-sm font-medium ${className}`}
		data-cy={dataCy}
		htmlFor={htmlFor}
		{...rest}
	>
		{text}
	</label>
);

export default Label;
