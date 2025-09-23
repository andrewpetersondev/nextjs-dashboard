import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import type { InputHTMLAttributes, JSX } from "react";
import type { FieldError } from "@/shared/forms/form-types";
import { ErrorMessage } from "@/ui/forms/error-message";

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
  const hasError = !!(error && error.length > 0);

  return (
    <div className="mb-4">
      <label className="block font-medium text-sm" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-2 rounded-md">
        <input
          aria-describedby={hasError ? `${id}-error` : undefined}
          aria-invalid={hasError}
          className="block w-full rounded-md border-0 px-8 py-2 text-text-primary outline-2 ring-1 ring-bg-accent ring-inset placeholder:text-text-accent focus:ring-2 focus:ring-bg-focus sm:text-sm"
          data-cy={dataCy}
          id={id}
          name={id}
          placeholder="Enter USD amount"
          step=".01"
          type="number"
          {...props}
        />
        <CurrencyDollarIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2 h-[18px] w-[18px] text-text-primary peer-focus:text-text-focus" />
      </div>
      <ErrorMessage
        dataCy="invoice-amount-error"
        error={error}
        id="invoice-amount-error"
        label="Invoice amount error"
      />
    </div>
  );
};
