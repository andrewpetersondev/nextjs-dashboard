import type { Metadata } from "next";
import type { JSX, ReactNode } from "react";

export const metadata: Metadata = {
  description: "Login and signup pages for the application.",
  title: "Authentication",
};

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="bg-blue-100">
      <div className="bg-red-100">{children}</div>
    </div>
  );
}
