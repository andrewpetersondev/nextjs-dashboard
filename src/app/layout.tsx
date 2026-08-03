import "@/app/globals.css";
import type { Metadata } from "next";
import type { JSX, ReactNode } from "react";
import { notoSans } from "@/ui/styles/fonts";

const APP_DESCRIPTION =
	"Acme — a portfolio dashboard by Andrew Peterson: invoices, customers, and user management built with Next.js App Router, strict TypeScript, and PostgreSQL.";

// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const metadata: Metadata = {
	description: APP_DESCRIPTION,
	metadataBase: new URL("https://nextjs-dashboard-beige-pi-12.vercel.app"),
	// og:image itself comes from the opengraph-image.tsx file convention; this
	// block adds the og:title/description/siteName tags that were never
	// emitted before. X falls back to og:* except twitter:card, hence the one
	// twitter field.
	openGraph: {
		description: APP_DESCRIPTION,
		siteName: "Acme Dashboard",
		title: "Acme Dashboard",
		type: "website",
		url: "/",
	},
	title: {
		default: "Acme Dashboard",
		template: "%s | Acme Dashboard",
	},
	twitter: {
		card: "summary_large_image",
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
				className={`scheme-light-dark h-full bg-bg-primary antialiased ${notoSans.className}`}
			>
				{children}
			</body>
		</html>
	);
}
