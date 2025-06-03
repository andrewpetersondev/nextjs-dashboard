import { demoUser } from "@/src/server-actions/users";
import { Button } from "@/src/ui/button";
import type { JSX } from "react";

export default function DemoUser({ text }: { text: string }): JSX.Element {
	return (
		<form
			action={async () => {
				await demoUser();
			}}
		>
			<Button
				data-cy="demo-user-button"
				className="mt-2 bg-bg-primary text-text-primary ring-bg-accent hover:bg-bg-accent focus-visible:ring-bg-focus flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ring-1 focus-visible:ring-2"
				type="submit"
			>
				{text}
			</Button>
		</form>
	);
}
