import "@/app/globals.css";
import type { Metadata } from "next";
import type { JSX, ReactNode } from "react";
import { isBannerDismissed } from "@/modules/banner/infrastructure/banner-cookie";
import { OneTimeBanner } from "@/modules/banner/presentation/one-time-banner";
import { notoSans } from "@/ui/styles/fonts";

// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const metadata: Metadata = {
  description: "The official Next.js Learn Dashboard is built with App Router.",
  metadataBase: new URL("https://next-learn-dashboard.vercel.sh"),
  title: {
    default: "Acme Dashboard",
    template: "%s | Acme Dashboard",
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}): Promise<JSX.Element> {
  const dismissed = await isBannerDismissed();

  return (
    <html className="scheme-light-dark h-full" lang="en">
      <body
        className={`scheme-light-dark h-full antialiased ${notoSans.className}`}
      >
        {!dismissed && <OneTimeBanner />}
        {children}
      </body>
    </html>
  );
}
