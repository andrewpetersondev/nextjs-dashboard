import { verifySessionOptimistic } from "@/src/lib/dal";
import type { UserSessionRole } from "@/src/lib/definitions/session";
import type { JSX } from "react";

export default async function MiddlewareCard(): Promise<JSX.Element> {
	const session: {
		isAuthorized: boolean;
		userId: string;
		role: UserSessionRole;
	} = await verifySessionOptimistic();
	const userId: string = session?.userId;
	const role: UserSessionRole = session?.role;
	const authy: boolean = session?.isAuthorized;

	return (
		<div>
			<p>User Id: {userId}</p>
			<p>Role: {role}</p>
			<p>{authy ? "Authorized" : "Not Authorized"}</p>
		</div>
	);
}
