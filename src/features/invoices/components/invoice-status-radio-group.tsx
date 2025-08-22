import { CheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { InputHTMLAttributes, JSX } from "react";
import type { InvoiceStatus } from "@/features/invoices/types";
import { ErrorMessage } from "@/ui/components/error-message";

/**
 * Props for InvoiceStatusRadioGroup.
 */
interface InvoiceStatusRadioGroupProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "type"> {
  value: InvoiceStatus;
  error?: string | string[] | undefined;
}

/**
 * InvoiceStatusRadioGroup
 * Renders a radio group for invoice status selection with error display.
 *
 * @param value - The current selected status value.
 * @param name - The name of the radio group.
 * @param disabled - Whether the inputs are disabled.
 * @param error - Error(s) to display.
 */
export const InvoiceStatusRadioGroup = ({
  value,
  name = "status",
  disabled,
  error,
  ...props
}: InvoiceStatusRadioGroupProps): JSX.Element => {
  // Normalize error to string[] for consistent handling
  const errors: string[] = [];
  if (error) {
    if (Array.isArray(error)) {
      errors.push(...error);
    } else if (typeof error === "string") {
      errors.push(error);
    }
  }

  const options = [
    {
      icon: <ClockIcon className="h-4 w-4" />,
      label: "Pending",
      value: "pending",
    },
    {
      icon: <CheckIcon className="h-4 w-4" />,
      label: "Paid",
      value: "paid",
    },
  ];

  return (
    <fieldset className="mb-4">
      <legend className="mb-2 block font-medium text-sm">
        Set the invoice status
      </legend>
      <div className="rounded-md border border-bg-accent px-[14px] py-3 outline-2 focus-within:ring-bg-focus focus:ring-2">
        <div className="flex gap-4">
          {options.map((opt) => (
            <div className="flex items-center" key={opt.value}>
              <input
                aria-describedby={
                  errors.length > 0 ? `${name}-error` : undefined
                }
                // aria-invalid={errors.length > 0}
                className="h-4 w-4 cursor-pointer border-bg-primary bg-bg-accent text-text-primary focus:ring-2"
                defaultChecked={value === opt.value}
                disabled={disabled}
                id={opt.value}
                name={name}
                type="radio"
                value={opt.value}
                {...props}
              />
              <label
                className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-bg-accent px-3 py-1.5 font-medium text-text-primary text-xs"
                htmlFor={opt.value}
              >
                {opt.label} {opt.icon}
              </label>
            </div>
          ))}
        </div>
      </div>
      <ErrorMessage
        dataCy="invoice-status-error"
        error={errors.length > 0 ? errors : undefined}
        id="invoice-status-error"
        label="Invoice status error"
      />
    </fieldset>
  );
};
