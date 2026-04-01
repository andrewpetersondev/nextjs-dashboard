import type { JSX, LabelHTMLAttributes } from "react";
import { cn } from "@/ui/utils/cn";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
	dataCy?: string;
	text: string;
}

/**
 * Accessible label primitive for form controls.
 */
export function LabelAtom({
	className,
	dataCy,
	htmlFor,
	text,
	...rest
}: LabelProps): JSX.Element {
	return (
		<label
			{...rest}
			className={cn("mb-2 block font-medium text-sm", className)}
			data-cy={dataCy}
			htmlFor={htmlFor}
		>
			{text}
		</label>
	);
}
