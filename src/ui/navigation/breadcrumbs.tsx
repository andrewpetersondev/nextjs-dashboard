import type { UrlObject } from "node:url";
import type { Route } from "next";
import Link from "next/link";
import type { JSX } from "react";
import { cn } from "@/ui/utils/cn";

type LinkHref = Route | UrlObject;

interface Breadcrumb {
	active?: boolean;
	href: LinkHref;
	label: string;
}

const BREADCRUMB_SEPARATOR = "/";

function makeBreadcrumbKey(breadcrumb: Breadcrumb): string {
	const hrefKey =
		typeof breadcrumb.href === "string"
			? breadcrumb.href
			: breadcrumb.href.pathname;

	return `${hrefKey ?? ""}::${breadcrumb.label}`;
}

/**
 * Breadcrumb navigation component.
 * @param props - Component props
 * @param props.breadcrumbs - List of breadcrumb items
 */
export function Breadcrumbs({
	breadcrumbs,
}: {
	breadcrumbs: readonly Breadcrumb[];
}): JSX.Element {
	return (
		<nav aria-label="Breadcrumb" className="mb-6 block">
			<ol className="flex text-xl md:text-2xl">
				{breadcrumbs.map((breadcrumb, index) => {
					const isActive: boolean = Boolean(breadcrumb.active);
					const isLast: boolean = index === breadcrumbs.length - 1;

					return (
						<li
							aria-current={isActive ? "page" : undefined}
							className={cn(
								isActive ? "text-text-active" : "text-text-primary",
							)}
							key={makeBreadcrumbKey(breadcrumb)}
						>
							<Link
								aria-disabled={isActive}
								href={breadcrumb.href}
								tabIndex={isActive ? -1 : 0}
							>
								{breadcrumb.label}
							</Link>
							{isLast ? null : (
								<span aria-hidden="true" className="mx-3 inline-block">
									{BREADCRUMB_SEPARATOR}
								</span>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
