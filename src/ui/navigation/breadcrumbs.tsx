import Link from "next/link";
import type { JSX } from "react";
import { cn } from "@/ui/utils/cn";

/**
 * Represents a single breadcrumb item.
 */
interface Breadcrumb {
  active?: boolean;
  href: string;
  label: string;
}

const BREADCRUMB_SEPARATOR = "/";

/**
 * Breadcrumb navigation component.
 * @param props - Component props
 * @param props.breadcrumbs - List of breadcrumb items
 */
export const Breadcrumbs = ({
  breadcrumbs,
}: {
  breadcrumbs: readonly Breadcrumb[];
}): JSX.Element => (
  <nav aria-label="Breadcrumb" className="mb-6 block">
    <ol className="flex text-xl md:text-2xl">
      {breadcrumbs.map((breadcrumb, index) => {
        const isActive = Boolean(breadcrumb.active);
        return (
          <li
            aria-current={isActive ? "page" : undefined}
            className={cn(isActive ? "text-text-active" : "text-text-primary")}
            key={`${breadcrumb.href}-${index}`}
          >
            <Link
              aria-disabled={isActive}
              href={breadcrumb.href}
              tabIndex={isActive ? -1 : 0}
            >
              {breadcrumb.label}
            </Link>
            {index < breadcrumbs.length - 1 && (
              <span aria-hidden="true" className="mx-3 inline-block">
                {BREADCRUMB_SEPARATOR}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
