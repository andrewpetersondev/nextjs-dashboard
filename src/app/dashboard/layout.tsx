import type { FC, ReactNode } from "react";
import { SideNav } from "@/src/ui/dashboard/sidenav";

/**
 * Dashboard layout component.
 * Provides sidebar navigation and main content area.
 * @param props - Layout props
 * @returns The dashboard layout
 */
export const experimental_ppr = true;

// Tailwind class constants for maintainability
const ROOT_LAYOUT_CLASS =
	"flex h-screen flex-col md:flex-row md:overflow-hidden";
const SIDENAV_WRAPPER_CLASS = "w-full flex-none md:w-64";
const MAIN_CONTENT_CLASS = "grow p-6 md:overflow-y-auto md:p-12";

interface LayoutProps {
	children: ReactNode;
}

/**
 * @component
 * @description Dashboard layout with sidebar navigation.
 * @access public
 */
const Layout: FC<LayoutProps> = ({ children }) => {
	return (
		<section aria-label="Dashboard Layout" className={ROOT_LAYOUT_CLASS}>
			<aside aria-label="Sidebar Navigation" className={SIDENAV_WRAPPER_CLASS}>
				<SideNav />
			</aside>
			<section className={MAIN_CONTENT_CLASS} tabIndex={-1}>
				{children}
			</section>
		</section>
	);
};

export default Layout;
