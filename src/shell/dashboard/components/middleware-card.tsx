import type { JSX } from "react";
import {
  GUEST_ROLE,
  USER_ROLES,
  type UserRole,
} from "@/modules/auth/domain/auth.roles";
import type { SessionVerificationResult } from "@/modules/auth/domain/sessions/session-payload.types";
import { verifySessionOptimistic } from "@/modules/auth/server/application/actions/verify-session-optimistic.action";
import { H6 } from "@/ui/atoms/typography/headings";

const allowedRoles: readonly UserRole[] = USER_ROLES;

export async function MiddlewareCard(): Promise<JSX.Element> {
  const session: SessionVerificationResult = await verifySessionOptimistic();

  const role: UserRole = allowedRoles.includes(session.role as UserRole)
    ? (session.role as UserRole)
    : (GUEST_ROLE as UserRole); // fallback to 'guest' if invalid

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
