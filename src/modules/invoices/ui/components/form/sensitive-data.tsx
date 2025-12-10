import { KeyIcon } from "@heroicons/react/24/outline";
import { type JSX, useId } from "react";
import type { FieldError } from "@/shared/forms/types/form.types";
import { InputFieldMolecule } from "@/ui/molecules/input-field.molecule";
import { INPUT_ICON_CLASS } from "@/ui/styles/icons.tokens";

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
  const sensitiveDataId = useId();
  return (
    <InputFieldMolecule
      dataCy="sensitive-data-input"
      defaultValue={value}
      disabled={disabled}
      error={error}
      icon={<KeyIcon className={INPUT_ICON_CLASS} />}
      id={sensitiveDataId}
      label="Sensitive Data"
      name="sensitiveData"
      required={true}
      type="text"
      {...props}
    />
  );
}
