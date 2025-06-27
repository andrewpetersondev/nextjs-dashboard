import clsx from "clsx";
import { forwardRef, type JSX } from "react";
import { ContainerInner, ContainerOuter } from "@/src/ui/container.tsx";

export const Background = forwardRef<
	React.ElementRef<"div">,
	React.ComponentPropsWithoutRef<"div"> & { pattern?: "grid" | "dot" }
>(function Background(
	{ className, children, pattern, ...props },
	ref,
): JSX.Element {
	const patternClass =
		pattern === "grid"
			? "bg-grid-pattern"
			: pattern === "dot"
				? "bg-dot-pattern"
				: "";
	return (
		<ContainerOuter
			className={clsx(patternClass, className)}
			ref={ref}
			{...props}
		>
			<ContainerInner>{children}</ContainerInner>
		</ContainerOuter>
	);
});
