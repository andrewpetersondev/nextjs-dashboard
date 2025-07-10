import type { FC } from "react";

interface ErrorMessageProps {
  dataCy?: string;
  error?: string | string[];
  id?: string;
  label?: string;
}

export const ErrorMessage: FC<ErrorMessageProps> = ({
  dataCy,
  error,
  id,
  label,
}) => {
  if (!error || (Array.isArray(error) && error.length === 0)) return null;

  const errors = Array.isArray(error) ? error : [error];

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
