import type { InputHTMLAttributes, JSX, ReactNode } from "react";
import { LabelAtom } from "@/ui/atoms/label.atom";
import { InputFieldCardWrapper } from "@/ui/layouts/input-field-card.wrapper";
import { FieldErrorComponent } from "@/ui/molecules/field-error-component";
import { cn } from "@/ui/utils/cn";

/**
 * Props for the InputField component.
 */
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  dataCy?: string;
  describedById?: string;
  // Accept dense errors (readonly string[]) to match FormState failure shape
  error?: readonly string[] | undefined;
  icon?: ReactNode;
  id: string;
  label: string;
}

/**
 * Reusable input field with label, icon, and error display.
 *
 * @param props - The properties for the input field. {id, label, icon, error, dataCy, describedById, ...rest}
 * @param props.id - Unique identifier for the input field.
 * @param props.label - Label text for the input field.
 * @param props.icon - Optional icon to display alongside the input field.
 * @param props.error - Optional array of error messages to display below the input field.
 * @param props.dataCy - Optional data attribute for testing (e.g., for Cypress).
 * @param props.describedById - Optional ID for the error description, used for accessibility.
 * @param props.rest -  ...rest - Additional input attributes (e.g., type, placeholder, etc.).
 * @returns Rendered input field with label, icon, and error handling.
 */
export function InputFieldMolecule(props: InputFieldProps): JSX.Element {
  const { id, label, icon, error, dataCy, describedById, className, ...rest } =
    props;

  const hasError = Array.isArray(error) && error.length > 0;

  return (
    <InputFieldCardWrapper>
      <div>
        <LabelAtom htmlFor={id} text={label} />
        <div className="flex items-center">
          <input
            aria-describedby={
              hasError ? (describedById ?? `${id}-errors`) : undefined
            }
            aria-invalid={hasError}
            className={cn(
              "block w-full rounded-md bg-bg-accent px-3 py-1.5 text-text-primary ring-1 ring-bg-accent ring-inset placeholder:text-text-accent focus:ring-2 focus:ring-bg-focus sm:text-sm/6",
              className,
            )}
            data-cy={dataCy}
            id={id}
            // Allow overriding name via props; default to id for convenience.
            name={rest.name ?? id}
            {...rest}
          />
          {/* Mark icon decorative for screen readers */}
          {icon ? <span aria-hidden="true">{icon}</span> : null}
        </div>
        {/* Only render FieldError if error is defined and non-empty */}
        {hasError && (
          <FieldErrorComponent
            dataCy={dataCy ? `${dataCy}-errors` : undefined}
            error={error}
            id={describedById ?? `${id}-errors`}
            label={`${label} error:`}
          />
        )}
      </div>
    </InputFieldCardWrapper>
  );
}
