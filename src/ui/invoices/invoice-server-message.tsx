import type { JSX } from "react";
import type { InvoiceCreateState } from "@/lib/definitions/invoices.types";

/**
 * Props for InvoiceServerMessage component.
 */
export interface InvoiceServerMessageProps {
	state: InvoiceCreateState;
	showAlert: boolean;
}

/**
 * Displays a server message for invoice actions.
 * Handles success and error states with accessible, animated alerts.
 *
 * @param props - InvoiceServerMessageProps
 * @returns JSX.Element
 */
export const InvoiceServerMessage = ({
	state,
	showAlert,
}: InvoiceServerMessageProps): JSX.Element => {
	// Constants for styling to avoid magic strings
	const SUCCESS_STYLES = "border-green-300 bg-green-50 text-green-800";
	const ERROR_STYLES = "border-red-300 bg-red-50 text-red-800";
	const BASE_STYLES =
		"pointer-events-auto absolute left-0 right-0 mx-auto mt-6 w-fit rounded-md border px-4 py-3 shadow-lg transition-all duration-500";

	if (!state.message) {
		// No message to display
		return <div className="relative min-h-[56px]" />;
	}

	return (
		<div className="relative min-h-[56px]">
			<div
				aria-live={state.success ? "polite" : "assertive"}
				className={`${BASE_STYLES} ${showAlert ? "translate-y-0 opacity-100" : "-translate-y-4 pointer-events-none opacity-0"} ${state.success ? SUCCESS_STYLES : ERROR_STYLES} `}
				data-cy={
					state.success
						? "create-invoice-success-message"
						: "create-invoice-error-message"
				}
				role={state.success ? "status" : "alert"}
			>
				{state.message}
			</div>
		</div>
	);
};
