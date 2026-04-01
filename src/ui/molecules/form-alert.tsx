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
 */
export function FormAlert({
	className,
	dataCy = "form-alert",
	message,
	type = "error",
}: FormAlertProps): JSX.Element {
	return (
		<div
			aria-atomic="true"
			aria-live="polite"
			className={cn("min-h-8 text-sm", className)}
		>
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
