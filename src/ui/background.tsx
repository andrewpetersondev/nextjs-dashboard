import { ContainerInner, ContainerOuter } from "@/src/ui/container";
import clsx from "clsx";
import { forwardRef } from "react";

export const Background = forwardRef<
	React.ElementRef<"div">,
	React.ComponentPropsWithoutRef<"div"> & { pattern?: "grid" | "dot" }
>(function Background({ className, children, pattern, ...props }, ref) {
	const patternClass =
		pattern === "grid"
			? "bg-grid-pattern"
			: pattern === "dot"
				? "bg-dot-pattern"
				: "";
	return (
		<ContainerOuter
			ref={ref}
			className={clsx(patternClass, className)}
			{...props}
		>
			<ContainerInner>{children}</ContainerInner>
		</ContainerOuter>
	);
});
