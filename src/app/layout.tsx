import "@/src/app/globals.css";
import type { Metadata } from "next";
import type React from "react";
import type { JSX } from "react";
import { notoSans } from "@/src/ui/style/fonts";

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
