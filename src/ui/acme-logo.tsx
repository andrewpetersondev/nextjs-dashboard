import { GlobeAltIcon } from "@heroicons/react/24/outline";
import type { JSX } from "react";

export default function AcmeLogo(): JSX.Element {
	return (
		<div
			className="bg-bg-secondary text-text-primary flex h-20 shrink-0 items-end rounded-lg p-4"
			data-testid="acme-logo"
		>
			<div className="flex flex-row items-center text-3xl leading-none md:text-5xl">
				<div className="sr-only">Acme Logo</div>
				<GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />
				<h1>Acme</h1>
			</div>
		</div>
	);
}
