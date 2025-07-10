import Link from "next/link";
import type { JSX } from "react";
import { AcmeLogo } from "@/ui/acme-logo";
import { NavLinksWrapper } from "@/ui/dashboard/nav-links-wrapper";
import { LogoutForm } from "@/ui/logout-form";

/**
 * SideNav component for dashboard layout.
 * Renders logo, navigation links, and logout form.
 * @returns Sidebar JSX element.
 */
export const SideNav = (): JSX.Element => {
	return (
		<nav
			aria-label="Dashboard sidebar"
			className="flex h-full flex-col px-3 py-4 md:px-2"
			data-cy="dashboard-sidenav"
		>
			<Link
				aria-label="Go to homepage"
				className="mb-2 flex h-20 items-end justify-start rounded-md bg-bg-secondary md:h-40"
				href="/"
				tabIndex={0}
			>
				<AcmeLogo />
			</Link>
			<div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
				<NavLinksWrapper />
				<div
					aria-hidden="true"
					className="hidden h-auto w-full grow rounded-md bg-bg-secondary md:block"
				/>
				<LogoutForm />
			</div>
		</nav>
	);
};
