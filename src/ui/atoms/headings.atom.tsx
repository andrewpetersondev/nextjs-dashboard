import React from "react";
import { notoSans, tektur } from "@/ui/styles/fonts";
import { cn } from "@/ui/utils/cn";

const headingStyles = {
	h1: "text-2xl md:text-3xl font-bold tracking-tight",
	h2: "text-xl md:text-2xl font-bold tracking-tight",
	h3: "text-lg md:text-xl font-semibold tracking-tight",
	h4: "text-base md:text-lg font-semibold tracking-tight",
	h5: "text-sm md:text-base font-medium tracking-tight",
	h6: "text-sm font-medium tracking-tight",
} as const;

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
	className?: string;
	children?: React.ReactNode;
	font?: "body" | "display" | "inherit";
};

type HeadingTag = keyof typeof headingStyles;

type HeadingComponent = React.ForwardRefExoticComponent<
	HeadingProps & React.RefAttributes<HTMLHeadingElement>
>;

/**
 * Factory for heading components.
 */
function createHeading<T extends HeadingTag>(tag: T): HeadingComponent {
	const fontClasses = {
		body: notoSans.className,
		display: tektur.className,
		inherit: "",
	} as const;

	// biome-ignore lint/suspicious/noReactForwardRef: forwardRef is intentional for UI primitives
	const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
		({ className, children, font = "display", ...props }, ref) =>
			React.createElement(
				tag,
				{
					...props,
					className: cn(fontClasses[font], headingStyles[tag], className),
					ref,
				},
				children,
			),
	);
	Heading.displayName = tag.toUpperCase();
	return Heading;
}

export const H1: HeadingComponent = createHeading("h1");
export const H2: HeadingComponent = createHeading("h2");
export const H3: HeadingComponent = createHeading("h3");
// export const H4: HeadingComponent = createHeading("h4");
// export const H5: HeadingComponent = createHeading("h5");
export const H6: HeadingComponent = createHeading("h6");
