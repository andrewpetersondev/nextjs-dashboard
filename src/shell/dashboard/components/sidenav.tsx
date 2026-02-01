import Link from "next/link";
import type { JSX } from "react";
import { LogoutForm } from "@/modules/auth/presentation/authn/components/forms/logout-form";
import { ROUTES } from "@/shared/routes/routes";
import { NavLinksWrapper } from "@/shell/dashboard/components/nav-links-wrapper";
import { AcmeLogo } from "@/ui/brand/acme-logo";

interface SideNavProps {
  readonly logoutAction: () => Promise<void>;
}

export const SideNav = ({ logoutAction }: SideNavProps): JSX.Element => {
  return (
    <nav
      aria-label="Dashboard sidebar"
      className="flex h-full flex-col px-3 py-4 md:px-2"
      data-cy="dashboard-sidenav"
    >
      <Link
        aria-label="Go to homepage"
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-bg-secondary md:h-40"
        href={ROUTES.dashboard.root}
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
        <LogoutForm logoutAction={logoutAction} />
      </div>
    </nav>
  );
};
