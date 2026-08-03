import type { JSX } from "react";
import { cn } from "@/ui/utils/cn";

interface FormAlertProps {
	className?: string;
	dataCy?: string;
	message?: string;
	type?: "error" | "success";
}

/**
 * Inline form alert for submission feedback.
 *
 * The container stays mounted (empty at idle) so screen readers treat it as
 * a live region before the first message arrives. role="alert" is reserved
 * for this single form-level message; it implies assertive + atomic delivery.
 */
export function FormAlertMolecule({
	className,
	dataCy = "form-alert",
	message,
	type = "error",
}: FormAlertProps): JSX.Element {
	return (
		<div className={cn("min-h-8 text-sm", className)} role="alert">
			{message ? (
				<p
					className={cn(
						"font-medium",
						type === "error" ? "text-text-error" : "text-text-primary",
					)}
					data-cy={dataCy}
				>
					{message}
				</p>
			) : null}
		</div>
	);
}
