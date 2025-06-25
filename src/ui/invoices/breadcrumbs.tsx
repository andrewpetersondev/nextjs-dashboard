import { clsx } from "clsx";
import Link from "next/link";
import type { JSX } from "react";

interface Breadcrumb {
	label: string;
	href: string;
	active?: boolean;
}

export default function Breadcrumbs({
	breadcrumbs,
}: {
	breadcrumbs: Breadcrumb[];
}): JSX.Element {
	return (
		<nav aria-label="Breadcrumb" className="mb-6 block">
			<ol className={clsx("flex text-xl md:text-2xl")}>
				{breadcrumbs.map(
					(breadcrumb: Breadcrumb, index: number): JSX.Element => (
						<li
							aria-current={breadcrumb.active}
							className={clsx(
								breadcrumb.active ? "text-text-active" : "text-text-primary",
							)}
							key={breadcrumb.href}
						>
							<Link href={breadcrumb.href}>{breadcrumb.label}</Link>
							{index < breadcrumbs.length - 1 ? (
								<span className="mx-3 inline-block">/</span>
							) : null}
						</li>
					),
				)}
			</ol>
		</nav>
	);
}
