import type { JSX } from "react";
import { isAppError } from "@/shared/errors/guards/error.guards";
import type {
  FormResult,
  FormSuccess,
} from "@/shared/forms/types/form-result.types";

/**
 * Extracts message and success status from various result types.
 *
 * @remarks
 * - Supports FormResult (with FormSuccess shape) and generic Result types
 * - Safely navigates nested message properties
 * - Returns undefined for message if not found (no forced fallbacks)
 */
type ServerMessageState<Tdata> = FormResult<Tdata>;

type ServerMessageProps<Tdata> = Readonly<{
  readonly showAlert: boolean;
  readonly state: ServerMessageState<Tdata>;
}>;

/**
 * Type guard to check if a value is FormSuccess.
 * FormSuccess has `data` and `message` properties.
 */
function isFormSuccess<Tdata>(value: unknown): value is FormSuccess<Tdata> {
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
function extractMessageAndSuccess<Tdata>(
  state: ServerMessageState<Tdata>,
): Readonly<{
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

  // Error branch: state.error is AppError
  const error = state.error;

  if (isAppError(error)) {
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
 * - Uses aria-live and role for accessibility
 * - Smooth animations for show/hide
 * - Conditional styling based on success state
 * - Integrates with form submission flow
 */
export function ServerMessage<Tdata>({
  state,
  showAlert,
}: ServerMessageProps<Tdata>): JSX.Element {
  const { message, success } = extractMessageAndSuccess(state);

  const baseStyles =
    "pointer-events-auto absolute right-0 left-0 mx-auto mt-6 w-fit rounded-md border px-4 py-3 shadow-lg transition-all duration-500";

  const visibilityStyles = showAlert
    ? "translate-y-0 opacity-100"
    : "-translate-y-4 pointer-events-none opacity-0";

  const semanticStyles = success
    ? "border-green-300 bg-green-50 text-green-800"
    : "border-red-300 bg-red-50 text-red-800";

  return (
    <div className="relative min-h-[56px]">
      {message && (
        <div
          aria-live={success ? "polite" : "assertive"}
          className={`${baseStyles} ${visibilityStyles} ${semanticStyles}`}
          data-cy={
            success
              ? "create-user-success-message"
              : "create-user-error-message"
          }
          data-testid={
            success ? "server-message-success" : "server-message-error"
          }
          role={success ? "status" : "alert"}
        >
          {message}
        </div>
      )}
    </div>
  );
}
