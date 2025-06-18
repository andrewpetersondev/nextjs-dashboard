import type { JSX } from "react";
import { DashboardSkeleton } from "@/src/ui/skeletons";

export default function Loading(): JSX.Element {
	return <DashboardSkeleton />;
}
