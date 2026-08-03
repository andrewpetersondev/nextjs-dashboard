import type { JSX, ReactNode } from "react";
import { AcmeLogo } from "@/ui/brand/acme-logo";
import { PageHeaderMolecule } from "@/ui/molecules/page-header.molecule";

interface AuthPageWrapperProps {
	children: ReactNode;
	title: string;
}

/**
 * Shared layout wrapper for authentication pages (Login, Signup, etc.).
 * Handles the centering, responsive width, and standard header. The brand
 * mark is the shared AcmeLogo (the CDN-hotlinked template logo is gone).
 */
export function AuthPageTemplate({
	children,
	title,
}: AuthPageWrapperProps): JSX.Element {
	return (
		<main className="h-full">
			<div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
				<PageHeaderMolecule logo={<AcmeLogo size="md" />} title={title} />
				<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
					{children}
				</div>
			</div>
		</main>
	);
}
