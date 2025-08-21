import React, {
  type InputHTMLAttributes,
  type JSX,
  type ReactNode,
  useImperativeHandle,
  useRef,
} from "react";
import type { FormFieldError } from "@/shared/forms/types";
import { FieldError } from "@/ui/auth/field-error";
import { InputFieldCard } from "@/ui/components/input-field-card";

/**
 * Props for the InputField component.
 */
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon?: ReactNode;
  error?: FormFieldError; // Use FormFieldError type for consistency
  dataCy?: string;
  describedById?: string;
  ref?: React.Ref<HTMLInputElement>;
}

/**
 * Reusable input field with label, icon, and error display.
 *
 * @param props - The properties for the input field. {id, label, icon, error, dataCy, describedById, ref, ...rest}
 * @param props.id - Unique identifier for the input field.
 * @param props.label - Label text for the input field.
 * @param props.icon - Optional icon to display alongside the input field.
 * @param props.error - Optional array of error messages to display below the input field.
 * @param props.dataCy - Optional data attribute for testing (e.g., for Cypress).
 * @param props.describedById - Optional ID for the error description, used for accessibility.
 * @param props.ref - Optional ref to expose the input element to parent components.
 * @param props.rest -  ...rest - Additional input attributes (e.g., type, placeholder, etc.).
 * @returns Rendered input field with label, icon, and error handling.
 */
export function InputField(props: InputFieldProps): JSX.Element {
  const { id, label, icon, error, dataCy, describedById, ref, ...rest } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  // Expose the input ref to parent if ref is provided
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  const hasError = Array.isArray(error) && error.length > 0;

  return (
    <InputFieldCard>
      <div>
        <label className="block font-medium text-sm/6" htmlFor={id}>
          {label}
        </label>
        <div className="mt-2 flex items-center">
          <input
            aria-describedby={
              hasError ? (describedById ?? `${id}-errors`) : undefined
            }
            aria-invalid={hasError}
            className="block w-full rounded-md bg-bg-accent px-3 py-1.5 text-text-primary ring-1 ring-bg-accent ring-inset placeholder:text-text-accent focus:ring-2 focus:ring-bg-focus sm:text-sm/6"
            data-cy={dataCy}
            id={id}
            name={id}
            ref={inputRef}
            {...rest}
          />
          {icon}
        </div>
        {/* Only render FieldError if error is defined and non-empty */}
        {hasError && (
          <FieldError
            dataCy={dataCy ? `${dataCy}-errors` : undefined}
            error={error}
            id={describedById ?? `${id}-errors`}
            label={`${label} error:`}
          />
        )}
      </div>
    </InputFieldCard>
  );
}
