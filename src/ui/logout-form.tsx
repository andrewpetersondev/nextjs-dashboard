import { PowerIcon } from "@heroicons/react/24/outline";
import { logout } from "@/src/server-actions/users";

export async function LogoutForm() {
  return (
    <form
      action={async () => {
        "use server";
        await logout();
      }}
    >
      <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-bg-accent p-3 text-sm font-medium hover:bg-bg-hover hover:text-text-hover md:flex-none md:justify-start md:p-2 md:px-3">
        <PowerIcon className="w-6" />
        <div className="hidden md:block">Sign Out</div>
      </button>
    </form>
  );
}
