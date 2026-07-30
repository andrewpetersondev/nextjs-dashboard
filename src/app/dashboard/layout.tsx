import type { JSX, ReactNode } from "react";
import { logoutAction } from "@/modules/auth/presentation/authn/actions/logout.action";
import { SessionRefresh } from "@/modules/auth/presentation/session/session-refresh";
import { isBannerDismissed } from "@/modules/banner/infrastructure/banner-cookie";
import { OneTimeBanner } from "@/modules/banner/presentation/one-time-banner";
import { DashboardSidebar } from "@/shell/dashboard/components/dashboard-sidebar";

const ROOT_LAYOUT_CLASS =
	"flex h-screen flex-col md:flex-row md:overflow-hidden";
const SIDENAV_WRAPPER_CLASS = "w-full flex-none md:w-64";
const MAIN_CONTENT_CLASS = "grow p-6 md:overflow-y-auto md:p-12";

export default async function DashboardLayout({
	children,
}: Readonly<{ children: ReactNode }>): Promise<JSX.Element> {
	const bannerDismissed = await isBannerDismissed();

	return (
		<section aria-label="Dashboard Layout" className={ROOT_LAYOUT_CLASS}>
			<SessionRefresh />
			<aside aria-label="Sidebar Navigation" className={SIDENAV_WRAPPER_CLASS}>
				<DashboardSidebar logoutAction={logoutAction} />
			</aside>
			<main className={MAIN_CONTENT_CLASS} tabIndex={-1}>
				{!bannerDismissed && <OneTimeBanner />}
				{children}
			</main>
		</section>
	);
}
