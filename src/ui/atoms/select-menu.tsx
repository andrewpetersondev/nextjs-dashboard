// `src/ui/atoms/select-menu.tsx`
import { UserCircleIcon } from "@heroicons/react/24/outline";
import React from "react";
import type { FieldError } from "@/shared/forms/domain/models/field-error";

type GenericSelectMenu = <T extends { id: string; name: string }>(
  props: SelectMenuProps<T>,
) => React.ReactElement;

type SelectMenuComponent = GenericSelectMenu & { displayName?: string };

/**
 * Props for the SelectMenu component.
 * @template T - The type of the option object.
 */
export interface SelectMenuProps<
  T extends { id: string; name: string } = { id: string; name: string },
> {
  options: T[];
  value?: string | undefined;
  defaultValue?: string;
  id: string;
  name: string;
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  dataCy?: string;
  disabled?: boolean;
  required?: boolean;
  error?: FieldError;
  /**
   * Optional id of the element that describes the select (e.g. the error container).
   * If not provided, falls back to `${name}-error`.
   */
  errorId?: string;
}

/**
 * Accessible, reusable select menu component.
 * Supports both controlled and uncontrolled usage.
 * @template T - The type of the option object.
 */
export const SelectMenu: SelectMenuComponent = React.memo(
  function SelectMenuInner<T extends { id: string; name: string }>({
    options,
    value,
    defaultValue,
    id,
    name,
    placeholder = "Select an option",
    onChange,
    className = "",
    dataCy,
    disabled = false,
    required,
    error,
    errorId,
  }: SelectMenuProps<T>): React.ReactElement {
    return (
      <div className="relative">
        <select
          aria-describedby={
            error && error.length > 0 ? (errorId ?? `${name}-error`) : undefined
          }
          aria-label={placeholder}
          className={`peer block w-full cursor-pointer rounded-md border border-bg-accent py-2 pl-10 text-sm outline-2 placeholder:text-text-secondary ${className}`}
          data-cy={dataCy}
          defaultValue={value === undefined ? defaultValue : undefined}
          // --- Controlled: use value if provided, else fallback to defaultValue (uncontrolled) ---
          disabled={disabled}
          id={id}
          name={name}
          onChange={onChange}
          required={required}
          // --- Controlled: use value if provided, else fallback to defaultValue (uncontrolled) ---
          value={value !== undefined ? value : undefined}
        >
          <option disabled={true} value="">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <UserCircleIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] text-text-primary" />
      </div>
    );
  },
) as unknown as SelectMenuComponent;

SelectMenu.displayName = "SelectMenu";
