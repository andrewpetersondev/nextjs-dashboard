import type { JSX } from "react";
import { verifySessionOptimistic } from "@/src/lib/dal/session-dal";
import type { SessionVerificationResult } from "@/src/lib/definitions/session.types";
import { USER_ROLES, type UserRole } from "@/src/lib/definitions/users.types";
import { H6 } from "@/src/ui/headings";

const allowedRoles: readonly UserRole[] = USER_ROLES;

export async function MiddlewareCard(): Promise<JSX.Element> {
	const session: SessionVerificationResult = await verifySessionOptimistic();

	const role: UserRole = allowedRoles.includes(session.role as UserRole)
		? (session.role as UserRole)
		: "guest"; // fallback to 'guest' if invalid

	const userId: string = String(session.userId);
	const authy: boolean = Boolean(session.isAuthorized);

	return (
		<ul data-cy="middleware-card">
			<li className="font-experiment">User Id: {userId} in experiment font</li>
			<li>
				<p>Role: {role} in eyegrab font</p>
			</li>
			<li>
				<H6>{authy ? "Authorized" : "Not Authorized"} in tektur font</H6>
			</li>
			<li>in notosans font</li>
		</ul>
	);
}
