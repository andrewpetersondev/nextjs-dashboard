import type { JSX } from "react";
import { DashboardSkeleton } from "@/src/ui/skeletons.tsx";

export default function Loading(): JSX.Element {
	return <DashboardSkeleton />;
}
