import type { JSX } from "react";
import { LabelAtom } from "@/ui/atoms/label.atom";
import {
  SelectMenuAtom,
  type SelectMenuProps,
} from "@/ui/atoms/select-menu.atom";
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
        <LabelAtom htmlFor={id} text={label} />
        <SelectMenuAtom
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
