import type { JSX, ReactNode } from "react";
import { cn } from "@/ui/utils/cn";

interface DividerProps {
	className?: string;
	label?: ReactNode;
}

/**
 * Horizontal divider with an optional centered label.
 */
export function DividerAtom({ className, label }: DividerProps): JSX.Element {
	return (
		<div className={cn("relative my-5", className)}>
			<div aria-hidden="true" className="absolute inset-0 flex items-center">
				<div className="w-full border-bg-accent border-t" />
			</div>
			{label ? (
				<div className="relative flex justify-center font-medium text-sm/6">
					<span className="bg-bg-primary px-6 text-text-secondary">
						{label}
					</span>
				</div>
			) : null}
		</div>
	);
}
