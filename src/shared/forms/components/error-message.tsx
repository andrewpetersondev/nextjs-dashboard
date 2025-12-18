import type { FC } from "react";
import type { FieldError } from "@/shared/forms/types/field-error.value";

interface ErrorMessageProps {
  dataCy?: string;
  error?: FieldError;
  id?: string;
  label?: string;
}

export const ErrorMessage: FC<ErrorMessageProps> = ({
  dataCy,
  error,
  id,
  label,
}) => {
  // With FormFieldError being a non-empty array, if error is provided it must have items.
  if (!error) {
    return null;
  }

  const errors = error;

  return (
    <div
      aria-live="assertive"
      className="text-text-error"
      data-cy={dataCy}
      id={id}
      role="alert"
    >
      {label && <p className="font-semibold">{label}</p>}
      <ul>
        {errors.map((err) => (
          <li key={err}>- {err}</li>
        ))}
      </ul>
    </div>
  );
};
