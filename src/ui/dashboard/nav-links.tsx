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
import { type AuthRole, ROLES } from "@/shared/auth/domain/roles";
import { ROUTES } from "@/shared/constants/routes";

/** Navigation link paths */
const NAV_LINKS = {
  CUSTOMERS: ROUTES.DASHBOARD.CUSTOMERS,
  HOME: ROUTES.DASHBOARD.ROOT,
  INVOICES: ROUTES.DASHBOARD.INVOICES,
  USERS: ROUTES.DASHBOARD.USERS,
} as const;

const ADMIN_ROLE = ROLES.ADMIN as AuthRole;

type NavLinksProps = {
  /** User role for conditional links*/
  role?: AuthRole;
};

type NavLink = {
  name: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

/**
 * Navigation links for the dashboard sidebar.
 * @param props - NavLinksProps
 * @returns JSX element with navigation links.
 */
export function NavLinks({ role }: NavLinksProps): JSX.Element {
  const pathname: string = usePathname();

  // Define base links
  const links: NavLink[] = [
    { href: NAV_LINKS.HOME, icon: HomeIcon, name: "Home" },
    { href: NAV_LINKS.INVOICES, icon: DocumentDuplicateIcon, name: "Invoices" },
    { href: NAV_LINKS.CUSTOMERS, icon: UserGroupIcon, name: "Customers" },
  ];

  // Only add a Users link for admin
  if (role === ADMIN_ROLE) {
    links.push({
      href: NAV_LINKS.USERS,
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
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 hover:bg-bg-hover hover:text-text-hover md:flex-none md:justify-start md:p-2 md:px-3",
              pathname === link.href
                ? "border-2 border-bg-active text-text-active"
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
