import type { JSX } from "react";

/**
 * Props for the FieldError component.
 */
interface FieldErrorProps {
  dataCy?: string | undefined;
  /** Dense errors: always an array (possibly empty). */
  error?: readonly string[] | undefined;
  id?: string;
  label?: string;
}

/**
 * FieldError displays field-level validation errors in a consistent, accessible format.
 *
 * Renders nothing when the provided dense error array is empty or undefined.
 *
 * @param props - The properties for the component.
 * @returns Rendered error messages as a list, or null if no errors are present.
 */
export function FieldErrorComponent({
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
        {error.map((message, index) => (
          <li key={`${message}-${index}`}>- {message}</li>
        ))}
      </ul>
    </div>
  );
}
