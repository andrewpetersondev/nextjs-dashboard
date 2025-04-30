import Link from "next/link";
import NavLinks from "@/src/ui/dashboard/nav-links";
import AcmeLogo from "@/src/ui/acme-logo";
import { LogoutForm } from "@/src/ui/logout-form";

export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-bg-accent md:h-40"
        href="/public"
      >
        <AcmeLogo />
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-bg-accent md:block"></div>
        <LogoutForm />
      </div>
    </div>
  );
}
