import type { ComponentType, JSX } from "react";
import { H2 } from "@/ui/atoms/headings.atom";

interface StatCardProps {
	icon: ComponentType<{ className: string }>;
	title: string;
	value: number | string;
}

export function StatCardAtom({
	icon: Icon,
	title,
	value,
}: StatCardProps): JSX.Element {
	return (
		<div className="rounded-xl bg-bg-secondary p-2 text-text-secondary shadow-xs">
			<div className="flex p-4">
				<Icon className="h-5 w-5 text-text-primary" />
				{/* h2 keeps the dashboard heading order (h1 → h2); the size classes pin the old h3 visuals */}
				<H2 className="ml-2 font-semibold text-lg md:text-xl">{title}</H2>
			</div>
			<p className="truncate rounded-xl px-4 py-8 text-center text-2xl">
				{value}
			</p>
		</div>
	);
}
