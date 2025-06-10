import { verifySessionOptimistic } from "@/src/dal/session-dal";
import type { UserSessionRole } from "@/src/lib/definitions/session";
import type { JSX } from "react";

const allowedRoles: UserSessionRole[] = ["admin", "user", "guest"];

export default async function MiddlewareCard(): Promise<JSX.Element> {
	const session = await verifySessionOptimistic();

	const role: UserSessionRole = allowedRoles.includes(
		session.role as UserSessionRole,
	)
		? (session.role as UserSessionRole)
		: "guest"; // fallback to 'guest' if invalid

	const userId: string = String(session.userId);
	const authy: boolean = Boolean(session.isAuthorized);

	return (
		<div>
			<p>User Id: {userId}</p>
			<p>Role: {role}</p>
			<p>{authy ? "Authorized" : "Not Authorized"}</p>
		</div>
	);
}
