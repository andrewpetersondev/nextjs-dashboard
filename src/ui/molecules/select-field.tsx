import type { JSX } from "react";
import { Label } from "@/ui/atoms/label";
import { SelectMenu, type SelectMenuProps } from "@/ui/atoms/select-menu";
import { FieldErrorComponent } from "@/ui/molecules/field-error-component";
import { InputFieldCard } from "@/ui/molecules/input-field-card";

interface SelectFieldProps<T extends { id: string; name: string }>
  extends SelectMenuProps<T> {
  dataCy?: string;
  describedById?: string;
  label: string;
}

/**
 * Reusable select field with label, card styling, and error display.
 * Mirrors the structure of InputField for consistency.
 */
export function SelectField<T extends { id: string; name: string }>(
  props: SelectFieldProps<T>,
): JSX.Element {
  const { id, label, error, dataCy, describedById, ...rest } = props;

  const hasError = Array.isArray(error) && error.length > 0;
  const errorId = describedById ?? `${id}-errors`;

  return (
    <InputFieldCard>
      <div>
        <Label htmlFor={id} text={label} />
        <SelectMenu
          dataCy={dataCy}
          error={error}
          errorId={errorId}
          id={id}
          {...rest}
        />
        {hasError && (
          <FieldErrorComponent
            dataCy={dataCy ? `${dataCy}-errors` : undefined}
            error={error}
            id={errorId}
            label={`${label} error:`}
          />
        )}
      </div>
    </InputFieldCard>
  );
}
