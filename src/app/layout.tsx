import "@/app/globals.css";
import type { Metadata } from "next";
import type { FC, ReactNode } from "react";
import { notoSans } from "@/ui/fonts";

/**
 * Root layout component.
 * Wraps the entire application.
 * @param props - Layout props
 * @returns The root layout
 */
export const metadata: Metadata = {
  description: "The official Next.js Learn Dashboard is built with App Router.",
  metadataBase: new URL("https://next-learn-dashboard.vercel.sh"),
  title: {
    default: "Acme Dashboard",
    template: "%s | Acme Dashboard",
  },
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html className="scheme-light-dark h-full" lang="en">
      <body
        className={`scheme-light-dark h-full antialiased ${notoSans.className}`}
      >
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
