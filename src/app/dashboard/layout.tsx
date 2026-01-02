import type { JSX, ReactNode } from "react";
import { logoutAction } from "@/modules/auth/infrastructure/actions/logout.action";
import { SessionRefresh } from "@/modules/auth/presentation/features/session-refresh";
import { SideNav } from "@/shell/dashboard/components/sidenav";

const ROOT_LAYOUT_CLASS =
  "flex h-screen flex-col md:flex-row md:overflow-hidden";
const SIDENAV_WRAPPER_CLASS = "w-full flex-none md:w-64";
const MAIN_CONTENT_CLASS = "grow p-6 md:overflow-y-auto md:p-12";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>): JSX.Element {
  return (
    <section aria-label="Dashboard Layout" className={ROOT_LAYOUT_CLASS}>
      <SessionRefresh />
      <aside aria-label="Sidebar Navigation" className={SIDENAV_WRAPPER_CLASS}>
        <SideNav logoutAction={logoutAction} />
      </aside>
      <main className={MAIN_CONTENT_CLASS} tabIndex={-1}>
        {children}
      </main>
    </section>
  );
}
