import { cookies } from "next/headers";
import type { FC, JSX, ReactNode } from "react";
import { logoutAction } from "@/server/auth/application/actions/logout.action";
import { SideNav } from "@/shell/dashboard/components/sidenav";
import { SignupToast } from "@/shell/dashboard/components/signup-toast";

const ROOT_LAYOUT_CLASS =
  "flex h-screen flex-col md:flex-row md:overflow-hidden";
const SIDENAV_WRAPPER_CLASS = "w-full flex-none md:w-64";
const MAIN_CONTENT_CLASS = "grow p-6 md:overflow-y-auto md:p-12";

interface LayoutProps {
  readonly children: ReactNode;
}

const Layout: FC<LayoutProps> = async ({
  children,
}: LayoutProps): Promise<JSX.Element> => {
  const cookieStore = await cookies();
  const successCookie = cookieStore.get("signup-success");

  // Cookie will auto-expire after 5 seconds, no manual deletion needed

  return (
    <section aria-label="Dashboard Layout" className={ROOT_LAYOUT_CLASS}>
      {successCookie && <SignupToast />}
      <aside aria-label="Sidebar Navigation" className={SIDENAV_WRAPPER_CLASS}>
        <SideNav logoutAction={logoutAction} />
      </aside>
      <main className={MAIN_CONTENT_CLASS} tabIndex={-1}>
        {children}
      </main>
    </section>
  );
};

export const experimental_ppr = true;

export default Layout;
