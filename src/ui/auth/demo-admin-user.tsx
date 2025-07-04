import type { JSX } from "react";
import { demoUser } from "@/src/lib/server-actions/users.actions";
import { Button } from "@/src/ui/button";

export function DemoAdminUser({ text }: { text: string }): JSX.Element {
	return (
		<form
			action={async (): Promise<void> => {
				await demoUser("admin");
			}}
		>
			<Button
				className="mt-2 bg-bg-primary text-text-primary ring-bg-accent hover:bg-bg-accent focus-visible:ring-bg-focus flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ring-1 focus-visible:ring-2"
				data-cy="demo-user-button"
				type="submit"
			>
				{text}
			</Button>
		</form>
	);
}
