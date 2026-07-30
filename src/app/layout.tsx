import "@/app/globals.css";
import type { Metadata } from "next";
import type { JSX, ReactNode } from "react";
import { isBannerDismissed } from "@/modules/banner/infrastructure/banner-cookie";
import { OneTimeBanner } from "@/modules/banner/presentation/one-time-banner";
import { notoSans } from "@/ui/styles/fonts";

// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const metadata: Metadata = {
	description:
		"Acme — a portfolio dashboard by Andrew Peterson: invoices, customers, and user management built with Next.js App Router, strict TypeScript, and PostgreSQL.",
	metadataBase: new URL("https://nextjs-dashboard-beige-pi-12.vercel.app"),
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
