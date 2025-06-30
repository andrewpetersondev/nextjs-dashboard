import Link from "next/link";
import type { ReactNode } from "react";

interface FormActionRowProps {
	cancelHref: string;
	cancelLabel?: string;
	children: ReactNode;
	className?: string;
}

export function FormActionRow({
	cancelHref,
	cancelLabel = "Cancel",
	children,
	className = "",
}: FormActionRowProps) {
	return (
		<div className={`mt-6 flex justify-end gap-4 ${className}`}>
			<Link
				className="bg-bg-accent text-text-primary hover:bg-bg-hover flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors"
				href={cancelHref}
			>
				{cancelLabel}
			</Link>
			{children}
		</div>
	);
}
