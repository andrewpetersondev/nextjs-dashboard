import { GlobeAltIcon } from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { BRAND_NAME } from "@/ui/brand/brand.constants";
import { tektur } from "@/ui/styles/fonts";
import { cn } from "@/ui/utils/cn";

const SIZES = {
	lg: { icon: "h-12 w-12", wordmark: "text-3xl md:text-5xl" },
	md: { icon: "h-8 w-8", wordmark: "text-2xl" },
} as const;

/**
 * The Acme brand mark: globe + tektur wordmark. Deliberately a <span>, not a
 * heading — a logo is not part of the document outline, and the previous
 * hard-coded <H1> here put a second h1 on every dashboard page. Pages own
 * their headings; this component owns only the mark.
 */
export function AcmeLogo({
	className,
	size = "md",
}: {
	className?: string;
	size?: keyof typeof SIZES;
}): JSX.Element {
	return (
		<span
			className={cn(
				"flex flex-row items-center gap-2 text-text-primary",
				className,
			)}
			data-testid="acme-logo"
		>
			<GlobeAltIcon
				aria-hidden={true}
				className={cn("rotate-[15deg]", SIZES[size].icon)}
			/>
			<span
				className={cn(
					tektur.className,
					"font-bold leading-none",
					SIZES[size].wordmark,
				)}
			>
				{BRAND_NAME}
			</span>
		</span>
	);
}
