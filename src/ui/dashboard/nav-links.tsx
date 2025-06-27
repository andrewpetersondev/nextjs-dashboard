"use client";

import {
	DocumentDuplicateIcon,
	HomeIcon,
	LockClosedIcon,
	UserGroupIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, JSX, SVGProps } from "react";

type NavLinksProps = {
	role?: string;
};

type NavLink = {
	name: string;
	href: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const baseLinks: NavLink[] = [
	{ href: "/dashboard", icon: HomeIcon, name: "Home" },
	{
		href: "/dashboard/invoices",
		icon: DocumentDuplicateIcon,
		name: "Invoices",
	},
	{ href: "/dashboard/customers", icon: UserGroupIcon, name: "Customers" },
];

export default function NavLinks({ role }: NavLinksProps): JSX.Element {
	const pathname: string = usePathname();
	const links: NavLink[] = [...baseLinks];

	// Only add Users link for admin
	if (role === "admin") {
		links.push({
			href: "/dashboard/users",
			icon: LockClosedIcon,
			name: "Users",
		});
	}

	return (
		<>
			{links.map((link: NavLink): JSX.Element => {
				const LinkIcon: ComponentType<SVGProps<SVGSVGElement>> = link.icon;
				return (
					<Link
						aria-current={pathname === link.href ? "page" : undefined}
						className={clsx(
							"hover:bg-bg-hover hover:text-text-hover flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 md:flex-none md:justify-start md:p-2 md:px-3",
							pathname === link.href
								? "border-bg-active text-text-active border-2"
								: "bg-bg-secondary text-text-secondary",
						)}
						href={link.href}
						key={link.name}
					>
						<LinkIcon aria-hidden="true" className="w-6" />
						<span className="sr-only md:not-sr-only">{link.name}</span>
					</Link>
				);
			})}
		</>
	);
}
