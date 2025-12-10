import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { type InputHTMLAttributes, type JSX, useId } from "react";
import { ErrorMessage } from "@/shared/forms/components/error-message";
import type { FieldError } from "@/shared/forms/types/form.types";

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
  const hasError = Boolean(error && error.length > 0);
  const invoiceAmountInputErrorId = useId();

  return (
    <div className="mb-4">
      <label className="block font-medium text-sm" htmlFor={id}>
        {label}
      </label>
      <div className="mt-2 flex items-center rounded-md">
        <input
          aria-describedby={hasError ? `${id}-error` : undefined}
          aria-invalid={hasError}
          className="block w-full rounded-md border-0 px-4 py-2 text-text-primary outline-2 ring-1 ring-bg-accent ring-inset placeholder:text-text-accent focus:ring-2 focus:ring-bg-focus sm:text-sm"
          data-cy={dataCy}
          id={id}
          name={id}
          placeholder="Enter USD amount"
          step=".01"
          type="number"
          {...props}
        />
        <CurrencyDollarIcon className="pointer-events-none ml-2 h-[18px] w-[18px] text-text-primary peer-focus:text-text-focus" />
      </div>
      <ErrorMessage
        dataCy="invoice-amount-error"
        error={error}
        id={invoiceAmountInputErrorId}
        label="Invoice amount error"
      />
    </div>
  );
};
