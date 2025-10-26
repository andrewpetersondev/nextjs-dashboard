import type { JSX } from "react";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import type {
  FormResult,
  FormSuccess,
} from "@/shared/forms/domain/models/form-result";

/**
 * Extracts message and success status from various result types.
 *
 * @remarks
 * - Supports FormResult (with FormSuccess shape) and generic Result types
 * - Safely navigates nested message properties
 * - Returns undefined for message if not found (no forced fallbacks)
 */
type ServerMessageState<TData = unknown> = FormResult<TData>;

type ServerMessageProps<TData = unknown> = Readonly<{
  readonly state: ServerMessageState<TData>;
  readonly showAlert: boolean;
}>;

/**
 * Type guard to check if a value is FormSuccess.
 * FormSuccess has `data` and `message` properties.
 */
function isFormSuccess<TData>(value: unknown): value is FormSuccess<TData> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return "data" in obj && "message" in obj && typeof obj.message === "string";
}

/**
 * Type guard to check if a value is AppError.
 * AppError has `code`, `message` properties and optional `details`.
 */
function isAppError(value: unknown): value is AppError {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    "code" in obj &&
    "message" in obj &&
    typeof obj.message === "string" &&
    typeof obj.code === "string"
  );
}

/**
 * Safely extract message and success flag from a FormResult.
 *
 * @remarks
 * - Uses type guards to safely navigate nested properties
 * - Returns success=true/false and optional message
 * - Never throws; returns sensible defaults
 */
function extractMessageAndSuccess<TData>(
  state: ServerMessageState<TData>,
): Readonly<{
  readonly message: string | undefined;
  readonly success: boolean;
}> {
  if (state.ok) {
    // Success branch: state.value is FormSuccess<TData>
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
export function ServerMessage<TData = unknown>({
  state,
  showAlert,
}: ServerMessageProps<TData>): JSX.Element {
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
