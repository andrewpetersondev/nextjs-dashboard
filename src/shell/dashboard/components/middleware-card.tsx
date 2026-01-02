import type { JSX } from "react";
import type { SessionTransport } from "@/modules/auth/application/dtos/session.transport";
import { verifySessionOptimistic } from "@/modules/auth/infrastructure/actions/verify-session-optimistic.action";
import {
  GUEST_ROLE,
  USER_ROLES,
  type UserRole,
} from "@/shared/domain/user/user-role.types";
import { H6 } from "@/ui/atoms/headings";

const allowedRoles: readonly UserRole[] = USER_ROLES;

export async function MiddlewareCard(): Promise<JSX.Element> {
  const session: SessionTransport = await verifySessionOptimistic();

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
