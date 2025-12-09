import type { JSX, LabelHTMLAttributes } from "react";
import { cn } from "@/ui/utils/cn";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  dataCy?: string;
  text: string;
}

/**
 * Accessible and reusable label component.
 */
export function Label({
  text,
  htmlFor,
  className,
  dataCy,
  ...rest
}: LabelProps): JSX.Element {
  return (
    <label
      className={cn("mb-2 block font-medium text-sm", className)}
      data-cy={dataCy}
      htmlFor={htmlFor}
      {...rest}
    >
      {text}
    </label>
  );
}
