import clsx from "clsx";
import React from "react";
import { tektur } from "@/src/ui/style/fonts";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
	className?: string;
	children: React.ReactNode;
};

const headingStyles = {
	h1: "text-2xl md:text-3xl font-bold tracking-tight",
	h2: "text-xl md:text-2xl font-bold tracking-tight",
	h3: "text-lg md:text-xl font-semibold tracking-tight",
	h4: "text-base md:text-lg font-semibold tracking-tight",
	h5: "text-sm md:text-base font-medium tracking-tight",
	h6: "text-sm font-medium tracking-tight",
} as const;

/**
 * Factory for heading components.
 */
function createHeading<T extends keyof typeof headingStyles>(tag: T) {
	const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
		({ className, children, ...props }, ref) =>
			React.createElement(
				tag,
				{
					className: clsx(tektur.className, headingStyles[tag], className),
					ref,
					...props,
				},
				children,
			),
	);
	Heading.displayName = tag.toUpperCase();
	return Heading;
}

export const H1 = createHeading("h1");
export const H2 = createHeading("h2");
export const H3 = createHeading("h3");
export const H4 = createHeading("h4");
export const H5 = createHeading("h5");
export const H6 = createHeading("h6");
