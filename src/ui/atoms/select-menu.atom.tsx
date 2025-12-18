import React from "react";
import type { FieldError } from "@/shared/forms/types/field-error.value";
import { INPUT_ICON_CLASS } from "@/ui/styles/icons.tokens";
import { cn } from "@/ui/utils/cn";

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
  className?: string;
  dataCy?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: FieldError;
  /**
   * Optional id of the element that describes the select (e.g. the error container).
   * If not provided, falls back to `${name}-error`.
   */
  errorId?: string;
  /**
   * Optional icon component to display on the left side.
   * Defaults to UserCircleIcon.
   */
  icon?: React.ComponentType<React.ComponentProps<"svg">>;
  id: string;
  name: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: T[];
  placeholder?: string;
  required?: boolean;
  value?: string | undefined;
}

/**
 * Accessible, reusable select menu component.
 * Supports both controlled and uncontrolled usage.
 * @template T - The type of the option object.
 */
// biome-ignore lint/style/useExportsLast: <this follows convention>
export const SelectMenuAtom: SelectMenuComponent = React.memo(
  function SelectMenuInner<T extends { id: string; name: string }>({
    className,
    dataCy,
    defaultValue,
    disabled = false,
    error,
    errorId,
    icon: Icon,
    id,
    name,
    onChange,
    options,
    placeholder = "Select an option",
    required,
    value,
  }: SelectMenuProps<T>): React.ReactElement {
    const errorDescriptionId =
      error && error.length > 0 ? (errorId ?? `${name}-error`) : undefined;

    return (
      <div className="relative flex items-center">
        <select
          aria-describedby={errorDescriptionId}
          aria-label={placeholder}
          className={cn(
            "peer block w-full cursor-pointer rounded-md bg-bg-accent py-2 pl-3 text-sm text-text-primary ring-1 ring-bg-accent ring-inset placeholder:text-text-secondary focus:ring-2 focus:ring-bg-focus",
            className,
          )}
          data-cy={dataCy}
          // --- Controlled: use value if provided, else fallback to defaultValue (uncontrolled) ---
          defaultValue={value === undefined ? defaultValue : undefined}
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
        {Icon && (
          <Icon
            className={cn(
              "ml-3 shrink-0",
              INPUT_ICON_CLASS,
              "h-[18px] w-[18px]",
            )}
          />
        )}
      </div>
    );
  },
) as unknown as SelectMenuComponent;

SelectMenuAtom.displayName = "SelectMenu";
