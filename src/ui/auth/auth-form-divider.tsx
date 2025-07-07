import type { FC, ReactNode } from "react";

export interface AuthFormDividerProps {
	/** The label to display in the divider */
	label: ReactNode;
	/** Optional: Additional class names for the wrapper */
	className?: string;
}

/**
 * AuthFormDivider
 * Reusable divider for authentication forms.
 *
 * @param props - AuthFormDividerProps
 * @returns Divider component with customizable label.
 */
export const AuthFormDivider: FC<AuthFormDividerProps> = ({
	label,
	className = "",
}) => (
	<div className={`relative my-5 ${className}`}>
		<div aria-hidden="true" className="absolute inset-0 flex items-center">
			<div className="border-bg-accent w-full border-t" />
		</div>
		<div className="relative flex justify-center text-sm/6 font-medium">
			<span className="bg-bg-primary text-text-secondary px-6">{label}</span>
		</div>
	</div>
);
