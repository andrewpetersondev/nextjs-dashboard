import type { Metadata } from "next";
import type { JSX, ReactNode } from "react";

// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const metadata: Metadata = {
  description: "Login and signup pages for the application.",
  title: "Authentication",
};

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return <>{children}</>;
}
