import type { FC, ReactNode } from "react";
import { cn } from "@/ui/utils/cn";

interface DividerProps {
  /** Optional label to display in the center of the divider */
  label?: ReactNode;
  /** Optional: Additional class names */
  className?: string;
}

/**
 * Divider
 * A horizontal rule that can optionally contain a centered label.
 */
export const Divider: FC<DividerProps> = ({
  label,
  className,
}: DividerProps) => {
  return (
    <div className={cn("relative my-5", className)}>
      <div aria-hidden="true" className="absolute inset-0 flex items-center">
        <div className="w-full border-bg-accent border-t" />
      </div>
      {label && (
        <div className="relative flex justify-center font-medium text-sm/6">
          <span className="bg-bg-primary px-6 text-text-secondary">
            {label}
          </span>
        </div>
      )}
    </div>
  );
};
