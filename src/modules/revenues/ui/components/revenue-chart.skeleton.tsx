import type { JSX } from "react";
import { shimmer } from "@/ui/skeletons/skeletons.constants";

export function RevenueChartSkeleton(): JSX.Element {
  return (
    <div className={`${shimmer} relative w-full overflow-hidden md:col-span-4`}>
      <div className="mb-4 h-8 w-36 rounded-md bg-bg-accent" />
      <div className="rounded-xl bg-bg-accent p-4">
        <div className="mt-0 grid h-[410px] grid-cols-12 items-end gap-2 rounded-md bg-bg-primary p-4 sm:grid-cols-13 md:gap-4" />
        <div className="flex items-center pt-6 pb-2">
          <div className="h-5 w-5 rounded-full bg-bg-primary" />
          <div className="ml-2 h-4 w-20 rounded-md bg-bg-primary" />
        </div>
      </div>
    </div>
  );
}
