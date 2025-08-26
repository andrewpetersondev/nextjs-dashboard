import { type JSX, memo, type NamedExoticComponent } from "react";

/**
 * Props for the FieldError component.
 */
interface FieldErrorProps {
  dataCy?: string | undefined;
  error?: readonly string[] | undefined;
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
export const FieldError: NamedExoticComponent<FieldErrorProps> = memo(
  function FieldError({
    dataCy,
    error,
    id,
    label,
  }: FieldErrorProps): JSX.Element | null {
    const hasErrors = Array.isArray(error) && error.length > 0;

    const content: JSX.Element | null = hasErrors ? (
      <div className="text-text-error" data-cy={dataCy} id={id} role="alert">
        {label && <p>{label}</p>}
        <ul>
          {(error as readonly string[])?.map((err: string, i: number) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <the key is unique enough>
            <li key={err + i}>- {err}</li>
          ))}
        </ul>
      </div>
    ) : null;

    return content;
  },
);
