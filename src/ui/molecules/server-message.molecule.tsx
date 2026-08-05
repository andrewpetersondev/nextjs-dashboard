import type { JSX } from "react";
import { isAppErrorDto } from "@/shared/core/errors/core/app-error.entity";
import type {
	FormResult,
	FormState,
	FormSuccessPayload,
} from "@/shared/forms/core/form-result.dto";

/**
 * State accepted by the molecule: `null` until the first submission (idle),
 * then a FormResult.
 */
type ServerMessageState<Tdata> = FormState<Tdata>;

type ServerMessageProps<Tdata> = Readonly<{
	readonly showAlert: boolean;
	readonly state: ServerMessageState<Tdata>;
}>;

/**
 * Type guard to check if a value is FormSuccess.
 * FormSuccess has `data` and `message` properties.
 */
function isFormSuccess<Tdata>(
	value: unknown,
): value is FormSuccessPayload<Tdata> {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	const obj = value as Record<string, unknown>;
	return "data" in obj && "message" in obj && typeof obj.message === "string";
}

/**
 * Safely extract message and success flag from a FormResult.
 *
 * @remarks
 * - Uses type guards to safely navigate nested properties
 * - Returns success=true/false and optional message
 * - Never throws; returns sensible defaults
 */
function extractMessageAndSuccess<Tdata>(state: FormResult<Tdata>): Readonly<{
	readonly message: string | undefined;
	readonly success: boolean;
}> {
	if (state.ok) {
		const value = state.value;

		if (isFormSuccess(value)) {
			return Object.freeze({
				message: value.message,
				success: true,
			});
		}

		// Fallback if shape is unexpected (defensive programming)
		return Object.freeze({
			message: undefined,
			success: true,
		});
	}

	// Error branch: state.error is a serialized AppError DTO
	const error = state.error;

	if (isAppErrorDto(error)) {
		return Object.freeze({
			message: error.message,
			success: false,
		});
	}

	// Fallback if error shape is unexpected (defensive programming)
	return Object.freeze({
		message: undefined,
		success: false,
	});
}

/**
 * Renders a dismissible server-side message (success or error).
 *
 * @remarks
 * - The container is the live region and stays mounted from idle on:
 *   screen readers only announce regions that exist before content arrives.
 *   role="alert" is reserved for this single form-level message.
 * - Smooth animations for show/hide
 * - Conditional styling based on success state
 * - Integrates with form submission flow
 */
export function ServerMessageMolecule<Tdata>({
	state,
	showAlert,
}: ServerMessageProps<Tdata>): JSX.Element {
	// Idle: no message yet, but the (empty) live region below still mounts.
	const { message, success } =
		state === null
			? { message: undefined, success: false }
			: extractMessageAndSuccess(state);

	const baseStyles =
		"pointer-events-auto absolute right-0 left-0 mx-auto mt-6 w-fit rounded-md border px-4 py-3 shadow-lg transition-all duration-500";

	const visibilityStyles = showAlert
		? "translate-y-0 opacity-100"
		: "-translate-y-4 pointer-events-none opacity-0";

	const semanticStyles = success
		? "border-green-300 bg-green-50 text-green-800"
		: "border-red-300 bg-red-50 text-red-800";

	return (
		<div className="relative min-h-[56px]" role="alert">
			{message ? (
				<div
					className={`${baseStyles} ${visibilityStyles} ${semanticStyles}`}
					data-cy={success ? "server-message-success" : "server-message-error"}
					data-testid={
						success ? "server-message-success" : "server-message-error"
					}
				>
					{message}
				</div>
			) : null}
		</div>
	);
}
