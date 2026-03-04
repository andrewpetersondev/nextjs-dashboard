import type { Route } from "next";
import Link from "next/link";
import type { JSX } from "react";
import type { UrlObject } from "url";
import { cn } from "@/ui/utils/cn";

type LinkHref = Route | UrlObject;

/**
 * Represents a single breadcrumb item.
 */
interface Breadcrumb {
	active?: boolean;
	href: LinkHref;
	label: string;
}

const BREADCRUMB_SEPARATOR = "/";

/**
 * Builds a stable React key for a breadcrumb item.
 * Avoids array-index keys to prevent subtle UI bugs when items are inserted/removed/reordered.
 */
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
export const Breadcrumbs = ({
	breadcrumbs,
}: {
	breadcrumbs: readonly Breadcrumb[];
}): JSX.Element => (
	<nav aria-label="Breadcrumb" className="mb-6 block">
		<ol className="flex text-xl md:text-2xl">
			{breadcrumbs.map((breadcrumb) => {
				const isActive = Boolean(breadcrumb.active);
				return (
					<li
						aria-current={isActive ? "page" : undefined}
						className={cn(isActive ? "text-text-active" : "text-text-primary")}
						key={makeBreadcrumbKey(breadcrumb)}
					>
						<Link
							aria-disabled={isActive}
							href={breadcrumb.href}
							tabIndex={isActive ? -1 : 0}
						>
							{breadcrumb.label}
						</Link>
						{breadcrumb !== breadcrumbs.at(-1) && (
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
