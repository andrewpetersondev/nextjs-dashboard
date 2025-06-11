import { verifySessionOptimistic } from "@/src/dal/session-dal";
import type { UserRole } from "@/src/lib/definitions/roles";
import { H6 } from "@/src/ui/headings";
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
		<ul>
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
