import "@/src/ui/global.css";
import { inter } from "@/src/ui/fonts";
import { Metadata } from "next";
import React from "react";
import ThemeToggle from "@/src/ui/theme-toggle";

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
    <html lang="en" className="h-full bg-primary dark">
      <body className={`${inter.className} antialiased h-full`}>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}