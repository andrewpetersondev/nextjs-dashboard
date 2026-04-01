import type { JSX, ReactNode } from "react";
import { cn } from "@/ui/utils/cn";

interface InputFieldCardWrapperProps {
	children: ReactNode;
	className?: string;
}

/**
 * Shared card shell for form controls.
 */
export function InputFieldCardWrapper({
	children,
	className,
}: InputFieldCardWrapperProps): JSX.Element {
	return (
		<div
			className={cn("mb-4 rounded-md bg-bg-secondary p-4 md:p-6", className)}
		>
			{children}
		</div>
	);
}
