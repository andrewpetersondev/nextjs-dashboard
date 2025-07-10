import Link from "next/link";
import type { ReactNode } from "react";

interface FormActionRowProps {
  cancelHref: string;
  cancelLabel?: string;
  children: ReactNode;
  className?: string;
}

export function FormActionRow({
  cancelHref,
  cancelLabel = "Cancel",
  children,
  className = "",
}: FormActionRowProps) {
  return (
    <div className={`mt-6 flex justify-end gap-4 ${className}`}>
      <Link
        className="flex h-10 items-center rounded-lg bg-bg-accent px-4 font-medium text-sm text-text-primary transition-colors hover:bg-bg-hover"
        href={cancelHref}
      >
        {cancelLabel}
      </Link>
      {children}
    </div>
  );
}
