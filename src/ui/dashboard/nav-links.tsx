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

type NavLinksProps = {
	role?: string;
};

const baseLinks = [
	{ name: "Home", href: "/dashboard", icon: HomeIcon },
	{
		name: "Invoices",
		href: "/dashboard/invoices",
		icon: DocumentDuplicateIcon,
	},
	{ name: "Customers", href: "/dashboard/customers", icon: UserGroupIcon },
];

export default function NavLinks({ role }: NavLinksProps) {
	const pathname = usePathname();
	const links = [...baseLinks];

	// Only add Users link for admin
	if (role === "admin") {
		links.push({
			name: "Users",
			href: "/dashboard/users",
			icon: LockClosedIcon,
		});
	}

	return (
		<>
			{links.map((link) => {
				const LinkIcon = link.icon;
				return (
					<Link
						key={link.name}
						href={link.href}
						className={clsx(
							"hover:bg-bg-hover hover:text-text-hover flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 md:flex-none md:justify-start md:p-2 md:px-3",
							pathname === link.href
								? "border-bg-active text-text-active border-2"
								: "bg-bg-secondary text-text-secondary",
						)}
					>
						<LinkIcon className="w-6" />
						<p className="hidden md:block">{link.name}</p>
					</Link>
				);
			})}
		</>
	);
}
