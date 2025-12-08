import type { JSX } from "react";
import { DashboardSkeleton } from "@/shell/dashboard/components/dashboard.skeletons";

export default function Loading(): JSX.Element {
  return <DashboardSkeleton />;
}
