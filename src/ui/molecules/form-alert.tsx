import type { FC } from "react";
import { cn } from "@/ui/utils/cn";

interface FormAlertProps {
  /** The message to display. If undefined/empty, nothing renders. */
  message?: string;
  /**
   * Type of alert. Defaults to 'error'.
   * 'error' renders red text, 'success' renders green (or primary/secondary depending on system).
   * Currently, the implementation follows the original design (error text).
   */
  type?: "error" | "success";
  /** Optional cypress data attribute */
  dataCy?: string;
  /** Optional additional classes */
  className?: string;
}

/**
 * FormAlert
 * Displays a form-level message (typically server errors or success messages).
 * Rendered with aria-live for accessibility.
 */
export const FormAlert: FC<FormAlertProps> = ({
  message,
  type = "error",
  dataCy = "form-alert",
  className,
}: FormAlertProps) => {
  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className={cn("flex h-8 items-end space-x-1", className)}
    >
      {message && (
        <p
          className={cn(
            type === "error" ? "text-text-error" : "text-text-primary",
          )}
          data-cy={dataCy}
        >
          {message}
        </p>
      )}
    </div>
  );
};
