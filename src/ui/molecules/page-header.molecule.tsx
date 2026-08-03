import type { FC, ReactNode } from "react";

interface PageHeaderProps {
	/** Optional sub-content or description */
	children?: ReactNode;
	/** Optional brand mark / logo node rendered above the title */
	logo?: ReactNode;
	/** Main heading text */
	title: string;
}

/**
 * PageHeader
 * A reusable header molecule with an optional logo slot and title.
 * Commonly used at the top of card-based layouts or auth pages.
 * The title is an h1: pages using this header have no other level-one
 * heading, and auth pages previously shipped with no h1 at all.
 */
export const PageHeaderMolecule: FC<PageHeaderProps> = ({
	title,
	children,
	logo,
}: PageHeaderProps) => {
	return (
		<div className="sm:mx-auto sm:w-full sm:max-w-md">
			{logo ? <div className="flex justify-center">{logo}</div> : null}
			<h1 className="mt-6 text-center font-bold text-2xl/9 text-text-primary tracking-tight">
				{title}
			</h1>
			{children}
		</div>
	);
};
