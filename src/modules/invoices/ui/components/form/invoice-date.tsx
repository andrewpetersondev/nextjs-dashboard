import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import type { InputHTMLAttributes, JSX } from "react";
import { InputField } from "@/ui/molecules/input-field";
import { INPUT_ICON_CLASS } from "@/ui/styles/icons.tokens";

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
    <InputField
      defaultValue={defaultValue}
      icon={<CalendarDaysIcon className={INPUT_ICON_CLASS} />}
      id={id}
      label={label}
      max={max}
      min={min}
      name={name}
      required={required}
      type="date"
      value={value}
      {...rest}
    />
  );
}
