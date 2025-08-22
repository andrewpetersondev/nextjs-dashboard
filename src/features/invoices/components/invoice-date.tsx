import type { InputHTMLAttributes, JSX } from "react";

/**
 * Uncontrolled date input component for invoice forms.
 *
 * @remarks
 * Currently uncontrolled - consider changing to controlled input with onChange handler.
 */
interface InvoiceDateProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  defaultValue: string;
  label?: string;
}

/**
 * Date input component that follows the invoice form design system.
 * Provides consistent styling with other form components.
 */
export function InvoiceDate({
  value,
  defaultValue,
  min = "2020-01-01",
  max = "2029-12-31",
  label = "Date",
  id = "date",
  name = "date",
  required = true,
  ...rest
}: InvoiceDateProps): JSX.Element {
  return (
    <div className="mb-4">
      <label className="block font-medium text-sm" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-2 rounded-md">
        <input
          className="block w-full rounded-md border-0 px-4 py-2 text-text-primary outline-2 ring-1 ring-bg-accent ring-inset placeholder:text-text-accent focus:ring-2 focus:ring-bg-focus sm:text-sm"
          defaultValue={defaultValue}
          id={id}
          max={max}
          min={min}
          name={name}
          required={required}
          type="date"
          value={value}
          {...rest}
        />
      </div>
    </div>
  );
}
