import "@/src/app/globals.css";
import { Metadata } from "next";
import React from "react";
import { inter } from "@/src/ui/style/fonts";

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
    <html lang="en" className="scheme-light-dark">
      <body
        className={`h-full antialiased scheme-light-dark ${inter.className}`}
      >
        {children}
      </body>
    </html>
  );
}
