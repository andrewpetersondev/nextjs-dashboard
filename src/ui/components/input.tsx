import type React from "react";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	/** Label for accessibility error description */
	ariaDescribedBy?: string;
	/** Data attribute for Cypress testing */
	dataCy?: string;
}

/**
 * Accessible, reusable input component.
 * @param props - InputProps
 * @returns JSX.Element
 */
export const DollarInput: React.FC<InputProps> = ({
	ariaDescribedBy,
	className = "",
	dataCy,
	...rest
}) => (
	<input
		aria-describedby={ariaDescribedBy}
		className={`peer border-bg-accent placeholder:text-text-primary block w-full rounded-md border py-2 pl-10 text-sm outline-2 ${className}`}
		data-cy={dataCy}
		{...rest}
	/>
);
