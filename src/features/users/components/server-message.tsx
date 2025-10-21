import type { JSX } from "react";
import type { ErrorCode } from "@/shared/core/errors/base/error-codes";
import type { Result } from "@/shared/core/result/result";
import type {
  FormResult,
  FormSuccess,
  FormValidationError,
} from "@/shared/forms/types/form-result.types";

// Accept either a plain Result with a message in success/error, or a FormResult
type ServerMessageState<TField extends string = string, TData = unknown> =
  | Result<
      { readonly code?: string; readonly message?: string },
      { readonly code: ErrorCode; readonly message: string }
    >
  | FormResult<TField, TData>;

type ServerMessageProps<TField extends string = string, TData = unknown> = {
  readonly state: ServerMessageState<TField, TData>;
  readonly showAlert: boolean;
};

function extractMessageAndSuccess<TField extends string, TData>(
  state: ServerMessageState<TField, TData>,
): { readonly message?: string; readonly success: boolean } {
  if (state.ok) {
    const value = state.value as
      | FormSuccess<TData>
      | { readonly message?: string };
    return { message: value.message, success: true };
  }
  const err = state.error as
    | FormValidationError<TField>
    | { readonly message: string };
  return { message: err.message, success: false };
}

export function ServerMessage<TField extends string = string, TData = unknown>({
  state,
  showAlert,
}: ServerMessageProps<TField, TData>): JSX.Element {
  const { message, success } = extractMessageAndSuccess(state);

  return (
    <div>
      <div className="relative min-h-[56px]">
        {message && (
          <div
            aria-live={success ? "polite" : "assertive"}
            className={`pointer-events-auto absolute right-0 left-0 mx-auto mt-6 w-fit rounded-md border px-4 py-3 shadow-lg transition-all duration-500 ${
              showAlert
                ? "translate-y-0 opacity-100"
                : "-translate-y-4 pointer-events-none opacity-0"
            } ${
              success
                ? "border-green-300 bg-green-50 text-green-800"
                : "border-red-300 bg-red-50 text-red-800"
            } `}
            data-cy={
              success
                ? "create-user-success-message"
                : "create-user-error-message"
            }
            role={success ? "status" : "alert"}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
