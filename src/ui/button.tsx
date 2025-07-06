import clsx from "clsx";
import type React from "react";
import type { JSX } from "react";

/**
 * Button component for user interactions.
 */
export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
}

export function Button({
	children,
	className,
	...rest
}: ButtonProps): JSX.Element {
	return (
		<button
			{...rest}
			className={clsx(
				"flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none",
				"bg-bg-accent text-text-accent",
				"hover:bg-bg-hover hover:text-text-hover",
				"active:bg-bg-active active:text-text-active",
				"focus-visible:outline focus-visible:outline-bg-focus focus-visible:outline-offset-2",
				"disabled:bg-bg-disabled disabled:text-text-disabled disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:bg-bg-disabled aria-disabled:text-text-disabled aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
				className,
			)}
		>
			{children}
		</button>
	);
}
