import "@/src/app/globals.css";
import { inter } from "@/src/ui/style/fonts";
import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
	title: {
		template: "%s | Acme Dashboard",
		default: "Acme Dashboard",
	},
	description: "The official Next.js Learn Dashboard built with App Router.",
	metadataBase: new URL("https://next-learn-dashboard.vercel.sh"),
};
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="h-full scheme-light-dark">
			<body
				className={`h-full antialiased scheme-light-dark ${inter.className}`}
			>
				{children}
			</body>
		</html>
	);
}
