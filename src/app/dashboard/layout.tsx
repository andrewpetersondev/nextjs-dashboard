import SideNav from "@/src/ui/dashboard/sidenav";
import type React from "react";

// todo: revert to false? investigate
export const experimental_ppr = true;

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
			<div className="w-full flex-none md:w-64">
				<SideNav />
			</div>
			<div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
		</div>
	);
}
