import { type JSX, memo } from "react";

/**
 * Props for the FieldError component.
 */
export interface FieldErrorProps {
  dataCy?: string | undefined;
  error?: string[] | undefined;
  id?: string;
  label?: string;
}

/**
 * FieldError displays field-level validation errors in a consistent, accessible format.
 *
 * @param dataCy - Optional data attribute for testing (e.g., for Cypress).
 * @param error - Optional array of error messages to display. If empty or undefined, nothing is rendered.
 * @param id - Optional ID for the error container, used for accessibility (e.g., aria-describedby).
 * @param label - Optional label displayed above the error messages for context.
 * @returns Rendered error messages as a list, or null if no errors are present.
 */
export const FieldError = memo(function FieldError({
  dataCy,
  error,
  id,
  label,
}: FieldErrorProps): JSX.Element | null {
  if (!error || error.length === 0) {
    return null;
  }

  return (
    <div className="text-text-error" data-cy={dataCy} id={id} role="alert">
      {label && <p>{label}</p>}
      <ul>
        {error.map((err: string, i: number) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <the key is unique enough>
          <li key={err + i}>- {err}</li>
        ))}
      </ul>
    </div>
  );
});
