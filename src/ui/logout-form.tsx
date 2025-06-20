import { PowerIcon } from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { logout } from "@/src/lib/server-actions/users";

export async function LogoutForm(): Promise<JSX.Element> {
	return (
		<form
			action={async (): Promise<void> => {
				"use server";
				await logout();
			}}
		>
			<button
				className="bg-bg-secondary hover:bg-bg-hover hover:text-text-hover flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium md:flex-none md:justify-start md:p-2 md:px-3"
				type="submit"
			>
				<PowerIcon className="w-6" />
				<div className="hidden md:block">Sign Out</div>
			</button>
		</form>
	);
}
