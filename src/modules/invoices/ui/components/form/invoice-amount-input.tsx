import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import type { InputHTMLAttributes, JSX } from "react";
import type { FieldError } from "@/shared/forms/types/form.types";
import { InputField } from "@/ui/molecules/input-field";
import { INPUT_ICON_CLASS } from "@/ui/styles/icons.tokens";

interface InvoiceAmountInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  dataCy?: string;
  error?: FieldError;
  label?: string;
}

export const InvoiceAmountInput = ({
  id = "amount",
  dataCy,
  label = "Choose an amount",
  error,
  ...props
}: InvoiceAmountInputProps): JSX.Element => {
  return (
    <InputField
      dataCy={dataCy}
      error={error}
      icon={<CurrencyDollarIcon className={INPUT_ICON_CLASS} />}
      id={id}
      label={label}
      name={props.name ?? id}
      placeholder="Enter USD amount"
      step="0.01"
      type="number"
      {...props}
    />
  );
};
