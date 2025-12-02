import "@/app/globals.css";
import type { Metadata } from "next";
import type { JSX, ReactNode } from "react";
import { SessionRefresh } from "@/modules/auth/components/session-refresh";
import { notoSans } from "@/ui/styles/fonts";

/**
 * Root layout component.
 * Wraps the entire application.
 * @param props - Layout props
 * @returns The root layout
 */
// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const metadata: Metadata = {
  description: "The official Next.js Learn Dashboard is built with App Router.",
  metadataBase: new URL("https://next-learn-dashboard.vercel.sh"),
  title: {
    default: "Acme Dashboard",
    template: "%s | Acme Dashboard",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <html className="scheme-light-dark h-full" lang="en">
      <body
        className={`scheme-light-dark h-full antialiased ${notoSans.className}`}
      >
        <SessionRefresh />
        {children}
      </body>
    </html>
  );
}
