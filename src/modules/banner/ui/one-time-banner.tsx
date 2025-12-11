"use client";

import { type JSX, useState, useTransition } from "react";
import { dismissBannerAction } from "@/modules/banner/server/actions/dismiss-banner.action";

export function OneTimeBanner(): JSX.Element | null {
  const [open, setOpen] = useState(true);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return null;
  }

  return (
    <div className="rounded-md bg-bg-secondary p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-text-primary">Heads up</p>
          <p className="text-sm text-text-secondary">
            This is a one-time banner. Dismiss it and it won’t come back (until
            you bump the cookie version).
          </p>
        </div>

        <button
          className="font-semibold text-sm text-text-secondary hover:text-text-primary"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await dismissBannerAction();
              setOpen(false);
            });
          }}
          type="button"
        >
          {pending ? "Saving…" : "Dismiss"}
        </button>
      </div>
    </div>
  );
}
