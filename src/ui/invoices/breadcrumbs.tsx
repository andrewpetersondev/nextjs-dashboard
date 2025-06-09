import { clsx } from "clsx";
import Link from "next/link";

interface Breadcrumb {
	label: string;
	href: string;
	active?: boolean;
}

export default function Breadcrumbs({
	breadcrumbs,
}: {
	breadcrumbs: Breadcrumb[];
}) {
	return (
		<nav aria-label="Breadcrumb" className="mb-6 block">
			<ol className={clsx("flex text-xl md:text-2xl")}>
				{breadcrumbs.map((breadcrumb, index) => (
					<li
						key={breadcrumb.href}
						aria-current={breadcrumb.active}
						className={clsx(
							breadcrumb.active ? "text-text-active" : "text-text-primary",
						)}
					>
						<Link href={breadcrumb.href}>{breadcrumb.label}</Link>
						{/*todo, do i want a null return value to be possible?*/}
						{index < breadcrumbs.length - 1 ? (
							<span className="mx-3 inline-block">/</span>
						) : null}
					</li>
				))}
			</ol>
		</nav>
	);
}
