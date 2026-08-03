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
const MAIN_CONTENT_ID = "main-content";

export default async function DashboardLayout({
	children,
}: Readonly<{ children: ReactNode }>): Promise<JSX.Element> {
	const bannerDismissed = await isBannerDismissed();

	return (
		<div className={ROOT_LAYOUT_CLASS}>
			{/* Off-screen until keyboard focus; the main's tabIndex={-1} receives it. */}
			<a
				className="absolute -top-full left-2 z-50 rounded-md bg-bg-accent px-4 py-2 text-sm text-text-accent focus:top-2"
				href={`#${MAIN_CONTENT_ID}`}
			>
				Skip to main content
			</a>
			<SessionRefresh />
			<div className={SIDENAV_WRAPPER_CLASS}>
				<DashboardSidebar logoutAction={logoutAction} />
			</div>
			<main className={MAIN_CONTENT_CLASS} id={MAIN_CONTENT_ID} tabIndex={-1}>
				{!bannerDismissed && <OneTimeBanner />}
				{children}
			</main>
		</div>
	);
}
