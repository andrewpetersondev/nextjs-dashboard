import { PowerIcon } from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { logout } from "@/server/actions/user";

/**
 * LogoutForm component for user sign out.
 * @returns {Promise<JSX.Element>}
 */
export async function LogoutForm(): Promise<JSX.Element> {
  return (
    <form
      action={async (): Promise<void> => {
        "use server";
        await logout();
      }}
    >
      <button
        aria-label="Sign Out"
        className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-bg-secondary p-3 font-medium text-sm hover:bg-bg-hover hover:text-text-hover md:flex-none md:justify-start md:p-2 md:px-3"
        type="submit"
      >
        <PowerIcon aria-hidden="true" className="w-6" />
        <span className="sr-only md:not-sr-only md:block">Sign Out</span>
      </button>
    </form>
  );
}
