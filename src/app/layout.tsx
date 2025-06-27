import "@/src/app/globals.css";
import type { Metadata } from "next";
import type React from "react";
import type { JSX } from "react";
import { notoSans } from "@/src/ui/style/fonts.ts";

// biome-ignore lint/style/useComponentExportOnlyModules: just ignore this rule
export const metadata: Metadata = {
	description: "The official Next.js Learn Dashboard built with App Router.",
	metadataBase: new URL("https://next-learn-dashboard.vercel.sh"),
	title: {
		default: "Acme Dashboard",
		template: "%s | Acme Dashboard",
	},
};

// biome-ignore lint/style/noDefaultExport: page and layout probably need to be default exports
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}): JSX.Element {
	return (
		<html className="h-full scheme-light-dark" lang="en">
			<body
				className={`h-full antialiased scheme-light-dark ${notoSans.className}`}
			>
				{children}
			</body>
		</html>
	);
}
