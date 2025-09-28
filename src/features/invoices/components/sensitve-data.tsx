import type { JSX } from "react";
import type { FieldError } from "@/shared/forms/types/field-errors";
import { Label } from "@/ui/atoms/label";
import { ErrorMessage } from "@/ui/forms/error-message";

/**
 * Controlled component because it has a default value of ""
 */
interface SensitiveDataProps {
  disabled?: boolean;
  error?: FieldError;
  value?: string;
}

export function SensitiveData({
  disabled = false,
  error,
  value = "this is a secret",
  ...props
}: SensitiveDataProps): JSX.Element {
  const hasError = !!(error && error.length > 0);
  const errorId = "sensitive-data-error";
  return (
    <div className="mb-4">
      <Label
        className="block font-medium text-sm"
        htmlFor="sensitiveData"
        text="Sensitive Data"
      />
      <div className="relative mt-2 rounded-md">
        <input
          aria-describedby={hasError ? errorId : undefined}
          aria-invalid={hasError}
          aria-label="Sensitive Data"
          autoComplete="off"
          className="block w-full rounded-md border-0 px-4 py-2 text-text-primary outline-2 ring-1 ring-bg-accent ring-inset placeholder:text-text-accent focus:ring-2 focus:ring-bg-focus sm:text-sm"
          data-cy="sensitive-data-input"
          defaultValue={value}
          disabled={disabled}
          id="sensitiveData"
          name="sensitiveData"
          required={true}
          type="text"
          {...props}
        />
      </div>
      {hasError && (
        <ErrorMessage
          dataCy={errorId}
          error={error}
          id={errorId}
          label="Sensitive data error"
        />
      )}
    </div>
  );
}
