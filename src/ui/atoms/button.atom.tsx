import type { ButtonHTMLAttributes, JSX, ReactNode } from "react";
import { cn } from "@/ui/utils/cn";

const VARIANTS = {
	danger: "bg-red-600 text-white hover:bg-red-500",
	outline: "border border-bg-accent text-text-primary hover:bg-bg-accent",
	primary:
		"bg-bg-primary text-text-primary ring-1 ring-bg-accent hover:bg-bg-accent",
	secondary:
		"bg-bg-accent text-text-accent hover:bg-bg-hover hover:text-text-hover",
} as const;

const SIZES = {
	lg: "h-12 px-6 text-base",
	md: "h-10 px-4 text-sm",
	sm: "h-9 px-3 text-sm",
} as const;

/**
 * Button component for user interactions.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	fullWidth?: boolean;
	isLoading?: boolean;
	loadingText?: ReactNode;
	size?: "sm" | "md" | "lg";
	variant?: "primary" | "secondary" | "outline" | "danger";
}

export function ButtonAtom({
	children,
	className,
	disabled,
	fullWidth = false,
	isLoading = false,
	loadingText,
	size = "md",
	variant = "primary",
	...rest
}: ButtonProps): JSX.Element {
	const isDisabled: boolean = isLoading || Boolean(disabled);

	return (
		<button
			{...rest}
			aria-disabled={isDisabled}
			className={cn(
				"flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none",
				"active:bg-bg-active active:text-text-active",
				"focus-visible:outline focus-visible:outline-bg-focus focus-visible:outline-offset-2",
				"disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-text-disabled disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:bg-bg-disabled aria-disabled:text-text-disabled aria-disabled:opacity-50",
				VARIANTS[variant],
				SIZES[size],
				fullWidth && "w-full",
				className,
			)}
			disabled={isDisabled}
		>
			{isLoading && loadingText ? loadingText : children}
		</button>
	);
}
