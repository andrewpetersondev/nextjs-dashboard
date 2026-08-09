import type { Route } from "next";
import Link from "next/link";
import type { JSX, ReactNode } from "react";
import { cn } from "@/ui/utils/cn";

interface FormActionRowProps {
	cancelHref: Route;
	cancelLabel: string;
	children: ReactNode;
	className?: string;
}

/**
 * Right-aligned footer for a form: a cancel link, then whatever you pass.
 *
 * Cancel is a `Link`, not a button — it navigates away rather than resetting, so
 * it never submits and never clears a half-filled form in place. Pass the submit
 * button as `children`; it lands to the right of cancel.
 */
export function FormActionRow({
	cancelHref,
	cancelLabel,
	children,
	className,
}: FormActionRowProps): JSX.Element {
	return (
		<div className={cn("mt-6 flex justify-end gap-4", className)}>
			<Link
				className="flex h-10 items-center rounded-lg bg-bg-accent px-4 font-medium text-sm text-text-primary transition-colors hover:bg-bg-hover"
				href={cancelHref}
			>
				{cancelLabel}
			</Link>
			{children}
		</div>
	);
}
