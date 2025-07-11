import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import type { InputHTMLAttributes, JSX } from "react";
import { ErrorMessage } from "@/components/error-message";

interface InvoiceAmountInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  dataCy?: string;
  error?: string | string[] | undefined;
  label?: string;
}

export const InvoiceAmountInput = ({
  id = "amount",
  dataCy,
  label = "Choose an amount",
  error,
  ...props
}: InvoiceAmountInputProps): JSX.Element => {
  // Ensure errors is string[] for consistent mapping
  const errors: string[] = [];
  if (error) {
    if (Array.isArray(error)) {
      errors.push(...error);
    } else if (typeof error === "string") {
      errors.push(error);
    }
  }

  return (
    <div className="mb-4">
      <label className="block font-medium text-sm" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-2 rounded-md">
        <input
          aria-describedby={errors.length > 0 ? `${id}-error` : undefined}
          aria-invalid={errors.length > 0}
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
        error={errors}
        id="invoice-amount-error"
        label="Invoice amount error"
      />
    </div>
  );
};
