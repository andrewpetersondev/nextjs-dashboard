import type { InputHTMLAttributes, JSX } from "react";

/**
 * Uncontrolled date input for now.
 *
 * @remarks
 * change to controlled input. need to add onChange handler.
 */
interface InvoiceDateProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  defaultValue: string;
  label?: string;
}

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
    <div className="my-4 bg-bg-secondary p-4">
      <label htmlFor={id}>{label}</label>
      <div className="m-1 flex items-center justify-between rounded-md border-4 border-bg-accent">
        <input
          className="flex-1 justify-between p-2"
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
