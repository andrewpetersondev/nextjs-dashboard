import { verifySessionOptimistic } from "@/src/dal/session-dal";
import type { UserRole } from "@/src/lib/definitions/roles";
import type { JSX } from "react";

const allowedRoles: UserRole[] = ["admin", "user", "guest"];

export default async function MiddlewareCard(): Promise<JSX.Element> {
	const session = await verifySessionOptimistic();

	const role: UserRole = allowedRoles.includes(session.role as UserRole)
		? (session.role as UserRole)
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
