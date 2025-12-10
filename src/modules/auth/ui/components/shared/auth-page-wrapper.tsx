import type { JSX, ReactNode } from "react";
import { BRAND_LOGO_SRC } from "@/ui/brand/brand.constants";
import { PageHeader } from "@/ui/molecules/page-header";

interface AuthPageWrapperProps {
  children: ReactNode;
  title: string;
}

/**
 * Shared layout wrapper for authentication pages (Login, Signup, etc.).
 * Handles the centering, responsive width, and standard header.
 */
export function AuthPageWrapper({
  children,
  title,
}: AuthPageWrapperProps): JSX.Element {
  return (
    <main className="h-full">
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <PageHeader logoSrc={BRAND_LOGO_SRC} title={title} />
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          {children}
        </div>
      </div>
    </main>
  );
}
