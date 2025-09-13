import { GlobeAltIcon } from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { H1 } from "@/ui/atoms/typography/headings";

/**
 * AcmeLogo component displays the Acme brand logo.
 * @returns {JSX.Element}
 */
export function AcmeLogo(): JSX.Element {
  return (
    <div
      className="flex h-20 shrink-0 items-end rounded-lg bg-bg-secondary p-4 text-text-primary"
      data-testid="acme-logo"
    >
      <div className="flex flex-row items-center text-3xl leading-none md:text-5xl">
        <div className="sr-only">Acme Logo</div>
        <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />
        <H1>Acme</H1>
      </div>
    </div>
  );
}
