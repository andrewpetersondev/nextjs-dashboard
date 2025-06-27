import Link from "next/link";
import type { JSX } from "react";
import { AcmeLogo } from "@/src/ui/acme-logo.tsx";
import { NavLinksWrapper } from "@/src/ui/dashboard/nav-links-wrapper.tsx";
import { LogoutForm } from "@/src/ui/logout-form.tsx";

export function SideNav(): JSX.Element {
	return (
		<div className="flex h-full flex-col px-3 py-4 md:px-2">
			<Link
				className="bg-bg-secondary mb-2 flex h-20 items-end justify-start rounded-md md:h-40"
				href="/"
			>
				<AcmeLogo />
			</Link>
			<div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-y-2 md:space-x-0">
				<NavLinksWrapper />
				<div className="bg-bg-secondary hidden h-auto w-full grow rounded-md md:block" />
				<LogoutForm />
			</div>
		</div>
	);
}
