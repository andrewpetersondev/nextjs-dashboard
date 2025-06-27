import type { JSX } from "react";
import { DashboardSkeleton } from "@/src/ui/skeletons.tsx";

// biome-ignore lint/style/noDefaultExport: page and layout probably need to be default exports
export default function Loading(): JSX.Element {
	return <DashboardSkeleton />;
}
